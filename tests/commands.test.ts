import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { handleInit } from '../src/commands/init.js';
import { handleBuild } from '../src/commands/build.js';
import { handleCheck } from '../src/commands/check.js';

describe('CLI Commands Integration', () => {
  const testDir = path.join(process.cwd(), 'tests', 'tmp_workspace');

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('runs rulesync init and creates AGENTS.md and config.json', async () => {
    await handleInit({ yes: true, cwd: testDir });

    expect(fs.existsSync(path.join(testDir, 'AGENTS.md'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, '.rulesync', 'config.json'))).toBe(true);
  });

  it('runs rulesync build and compiles all targets', async () => {
    await handleInit({ yes: true, cwd: testDir });
    const buildSuccess = await handleBuild({ cwd: testDir });

    expect(buildSuccess).toBe(true);
    expect(fs.existsSync(path.join(testDir, 'CLAUDE.md'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, '.cursor', 'rules', 'rulesync.mdc'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, '.github', 'copilot-instructions.md'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, '.cline', 'instructions.json'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, '.windsurfrules'))).toBe(true);
  });

  it('runs rulesync check and validates synchronized state', async () => {
    await handleInit({ yes: true, cwd: testDir });
    await handleBuild({ cwd: testDir });

    const checkSuccess = await handleCheck({ quiet: true, cwd: testDir });
    expect(checkSuccess).toBe(true);

    // Modify source AGENTS.md without building
    fs.appendFileSync(path.join(testDir, 'AGENTS.md'), '\n## Extra Rule\nBody content.');

    const checkOutSync = await handleCheck({ quiet: true, cwd: testDir });
    expect(checkOutSync).toBe(false);
  });
});
