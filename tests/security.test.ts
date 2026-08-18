import { describe, it, expect } from 'vitest';
import { sanitizeWorkspacePath } from '../src/utils/path.js';

describe('Security Path Traversal Shield', () => {
  it('allows paths within workspace boundary', () => {
    const cwd = '/home/user/workspace';
    const safePath = sanitizeWorkspacePath('AGENTS.md', cwd);
    expect(safePath).toBe('/home/user/workspace/AGENTS.md');

    const safeSub = sanitizeWorkspacePath('.cursor/rules/rulesync.mdc', cwd);
    expect(safeSub).toBe('/home/user/workspace/.cursor/rules/rulesync.mdc');
  });

  it('blocks relative path traversal escaping workspace', () => {
    const cwd = '/home/user/workspace';
    expect(() => {
      sanitizeWorkspacePath('../../etc/passwd', cwd);
    }).toThrow(/Security Exception: Path traversal attempt blocked/);
  });

  it('blocks sibling paths that only share the workspace prefix', () => {
    const cwd = '/home/user/workspace';
    expect(() => {
      sanitizeWorkspacePath('../workspace-evil/secret.md', cwd);
    }).toThrow(/Security Exception: Path traversal attempt blocked/);
  });
});
