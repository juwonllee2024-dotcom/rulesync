import { describe, it, expect } from 'vitest';
import { parseMarkdownToART } from '../src/parser/art.js';
import { compileToTargets } from '../src/compiler/matrix.js';

describe('Compiler Matrix Adapters', () => {
  const md = `# Repo Rules\n\nOverview statement.\n\n## TypeScript Standard\n<!-- globs: *.ts -->\nUse strict types.`;

  it('compiles to Claude Code format (CLAUDE.md)', () => {
    const art = parseMarkdownToART(md);
    const outputs = compileToTargets(art, ['claude']);

    expect(outputs).toHaveLength(1);
    expect(outputs[0].relativePath).toBe('CLAUDE.md');
    expect(outputs[0].content).toContain('# Repo Rules');
    expect(outputs[0].content).toContain('Use strict types.');
  });

  it('compiles to Cursor MDC format (.cursor/rules/rulesync.mdc)', () => {
    const art = parseMarkdownToART(md);
    const outputs = compileToTargets(art, ['cursor']);

    expect(outputs).toHaveLength(1);
    expect(outputs[0].relativePath).toBe('.cursor/rules/rulesync.mdc');
    expect(outputs[0].content).toContain('description: Repo Rules');
    expect(outputs[0].content).toContain('alwaysApply: true');
  });

  it('compiles to Copilot format (.github/copilot-instructions.md)', () => {
    const art = parseMarkdownToART(md);
    const outputs = compileToTargets(art, ['copilot']);

    expect(outputs).toHaveLength(1);
    expect(outputs[0].relativePath).toBe('.github/copilot-instructions.md');
    expect(outputs[0].content).toContain('GitHub Copilot Repository Instructions');
  });

  it('compiles to Cline JSON format (.cline/instructions.json)', () => {
    const art = parseMarkdownToART(md);
    const outputs = compileToTargets(art, ['cline']);

    expect(outputs).toHaveLength(1);
    expect(outputs[0].relativePath).toBe('.cline/instructions.json');
    const parsed = JSON.parse(outputs[0].content);
    expect(parsed.title).toBe('Repo Rules');
    expect(parsed.customInstructions).toContain('TypeScript Standard');
  });

  it('compiles to Windsurf format (.windsurfrules)', () => {
    const art = parseMarkdownToART(md);
    const outputs = compileToTargets(art, ['windsurf']);

    expect(outputs).toHaveLength(1);
    expect(outputs[0].relativePath).toBe('.windsurfrules');
    expect(outputs[0].content).toContain('**TypeScript Standard**');
  });
});
