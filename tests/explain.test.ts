import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  createContextExplanation,
  handleExplain,
  renderExplainMarkdown,
} from '../src/explain/index.js';

describe('Context Lens explanation', () => {
  const testDir = path.join(process.cwd(), 'tests', 'tmp_explain_workspace');

  beforeEach(() => {
    if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
    fs.mkdirSync(path.join(testDir, '.rulesync'), { recursive: true });
    fs.writeFileSync(path.join(testDir, 'AGENTS.md'), `# Repository Rules

## TypeScript
<!-- globs: src/**/*.ts, src/**/*.tsx -->
Use strict TypeScript.

## Tests
<!-- globs: tests/**/*.ts -->
Test every behavior.

## Safety
Never execute destructive commands.
`, 'utf8');
    fs.writeFileSync(path.join(testDir, '.rulesync', 'config.json'), JSON.stringify({
      source: 'AGENTS.md',
      targets: ['cursor', 'claude'],
    }), 'utf8');
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('explains which scoped rules apply to a file and why', () => {
    const report = createContextExplanation('src/app.ts', { cwd: testDir, target: 'cursor' });

    expect(report.input.path).toBe('src/app.ts');
    expect(report.target).toEqual({ target: 'cursor', path: '.cursor/rules/rulesync.mdc' });
    expect(report.rules.map((rule) => [rule.title, rule.status, rule.reason])).toEqual([
      ['TypeScript', 'applies', 'glob-match'],
      ['Tests', 'excluded', 'glob-miss'],
      ['Safety', 'applies', 'unscoped'],
    ]);
    expect(report.summary).toEqual({ applies: 2, excluded: 1, total: 3 });
  });

  it('normalizes Windows paths and blocks workspace escape', () => {
    const report = createContextExplanation('src\\app.ts', { cwd: testDir });

    expect(report.input.path).toBe('src/app.ts');
    expect(() => createContextExplanation('../outside.ts', { cwd: testDir })).toThrow(/Security Exception/);
  });

  it('renders a review-safe markdown explanation without rule contents', () => {
    const report = createContextExplanation('tests/example.ts', { cwd: testDir, target: 'claude' });
    const markdown = renderExplainMarkdown(report);

    expect(markdown).toContain('# RuleSync Context Lens');
    expect(markdown).toContain('`tests/example.ts`');
    expect(markdown).toContain('APPLIES');
    expect(markdown).toContain('EXCLUDED');
    expect(markdown).toContain('Static scope prediction');
    expect(markdown).not.toContain('Use strict TypeScript.');
  });

  it('writes machine-readable JSON for CI or pull requests', () => {
    const outputPath = path.join(testDir, '.rulesync', 'context-lens.json');
    const result = handleExplain('src/app.ts', {
      cwd: testDir,
      format: 'json',
      output: outputPath,
    });

    expect(result).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    expect(parsed.input.path).toBe('src/app.ts');
    expect(parsed.summary.applies).toBe(2);
  });
});
