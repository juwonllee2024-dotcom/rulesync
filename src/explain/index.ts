/**
 * Context Lens: explain which canonical rules match one workspace file.
 *
 * This is a static scope prediction. It does not claim that a provider
 * loaded or obeyed the generated instructions at runtime.
 */

import * as fs from 'fs';
import * as path from 'path';
import { compileToTargets } from '../compiler/matrix.js';
import { loadConfig } from '../config/index.js';
import { parseMarkdownToART } from '../parser/art.js';
import { TargetAdapterName } from '../types/index.js';
import { normalizeRelativePath, sanitizeWorkspacePath } from '../utils/path.js';

export type ExplainFormat = 'pretty' | 'json' | 'markdown';
export type ExplainRuleStatus = 'applies' | 'excluded';
export type ExplainRuleReason = 'always-apply' | 'unscoped' | 'glob-match' | 'glob-miss';

export interface ExplainRule {
  id: string;
  title: string;
  line: number;
  globs: string[];
  status: ExplainRuleStatus;
  reason: ExplainRuleReason;
}

export interface ExplainTarget {
  target: TargetAdapterName;
  path: string;
}

export interface ContextExplanation {
  schemaVersion: 1;
  generatedAt: string;
  input: { path: string };
  source: { path: string };
  target?: ExplainTarget;
  targets: ExplainTarget[];
  rules: ExplainRule[];
  summary: { applies: number; excluded: number; total: number };
  caveat: string;
}

export interface ExplainOptions {
  cwd?: string;
  target?: TargetAdapterName;
  format?: ExplainFormat;
  output?: string;
  generatedAt?: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function globToRegExp(glob: string): RegExp {
  const normalized = glob.replace(/\\/g, '/').replace(/^\.\//, '');
  let source = '^';

  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index];
    if (character === '*' && normalized[index + 1] === '*') {
      if (normalized[index + 2] === '/') {
        source += '(?:.*/)?';
        index += 2;
      } else {
        source += '.*';
        index += 1;
      }
    } else if (character === '*') {
      source += '[^/]*';
    } else if (character === '?') {
      source += '[^/]';
    } else if (character === '{') {
      const close = normalized.indexOf('}', index + 1);
      if (close === -1) {
        source += escapeRegExp(character);
      } else {
        const alternatives = normalized
          .slice(index + 1, close)
          .split(',')
          .map((alternative) => escapeRegExp(alternative))
          .join('|');
        source += `(?:${alternatives})`;
        index = close;
      }
    } else {
      source += escapeRegExp(character);
    }
  }

  return new RegExp(`${source}$`);
}

function matchesGlob(inputPath: string, pattern: string): boolean {
  return globToRegExp(pattern).test(inputPath);
}

function explainRule(
  rule: ReturnType<typeof parseMarkdownToART>['rules'][number],
  globalGlobs: string[] | undefined,
  inputPath: string,
): ExplainRule {
  const globs = rule.metadata.globs ?? globalGlobs ?? [];
  if (rule.metadata.alwaysApply) {
    return { id: rule.metadata.id, title: rule.metadata.title, line: rule.line, globs, status: 'applies', reason: 'always-apply' };
  }
  if (globs.length === 0) {
    return { id: rule.metadata.id, title: rule.metadata.title, line: rule.line, globs, status: 'applies', reason: 'unscoped' };
  }
  const matched = globs.some((glob) => matchesGlob(inputPath, glob));
  return {
    id: rule.metadata.id,
    title: rule.metadata.title,
    line: rule.line,
    globs,
    status: matched ? 'applies' : 'excluded',
    reason: matched ? 'glob-match' : 'glob-miss',
  };
}

export function createContextExplanation(
  inputPath: string,
  options: Pick<ExplainOptions, 'cwd' | 'target' | 'generatedAt'> = {},
): ContextExplanation {
  const cwd = options.cwd || process.cwd();
  if (!inputPath.trim()) throw new Error('Input path is required.');

  const absoluteInputPath = sanitizeWorkspacePath(inputPath, cwd);
  const relativeInputPath = normalizeRelativePath(absoluteInputPath, cwd);
  if (!relativeInputPath || relativeInputPath === '.') throw new Error('Input path must identify a workspace file.');

  const config = loadConfig(cwd);
  const sourcePath = sanitizeWorkspacePath(config.source, cwd);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source rule file "${config.source}" not found. Run "rulesync init" first.`);
  }

  const markdown = fs.readFileSync(sourcePath, 'utf8');
  const art = parseMarkdownToART(markdown, config.source);
  const targetOutputs = compileToTargets(art, options.target ? [options.target] : config.targets, config);
  const rules = art.rules.map((rule) => explainRule(rule, art.globalGlobs, relativeInputPath));
  const applies = rules.filter((rule) => rule.status === 'applies').length;

  return {
    schemaVersion: 1,
    generatedAt: options.generatedAt || new Date().toISOString(),
    input: { path: relativeInputPath },
    source: { path: config.source },
    ...(options.target && targetOutputs[0]
      ? { target: { target: targetOutputs[0].target, path: targetOutputs[0].relativePath } }
      : {}),
    targets: targetOutputs.map((output) => ({ target: output.target, path: output.relativePath })),
    rules,
    summary: { applies, excluded: rules.length - applies, total: rules.length },
    caveat: 'Static scope prediction only; it does not prove an agent loaded or obeyed these rules at runtime.',
  };
}

function escapeMarkdown(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
}

export function renderExplainJson(report: ContextExplanation): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function renderExplainMarkdown(report: ContextExplanation): string {
  const targetLabel = report.target
    ? `\`${report.target.target}\` → \`${escapeMarkdown(report.target.path)}\``
    : report.targets.map((target) => `\`${target.target}\``).join(', ');
  const lines = [
    '# RuleSync Context Lens',
    '',
    `Input: \`${escapeMarkdown(report.input.path)}\``,
    `Source: \`${escapeMarkdown(report.source.path)}\``,
    `Target: ${targetLabel}`,
    `Summary: ${report.summary.applies} applies · ${report.summary.excluded} excluded · ${report.summary.total} total`,
    '',
    '| Status | Rule | Source line | Scope | Reason |',
    '| --- | --- | ---: | --- | --- |',
    ...report.rules.map((rule) => [
      rule.status.toUpperCase(),
      escapeMarkdown(rule.title),
      String(rule.line),
      rule.globs.length > 0 ? `\`${escapeMarkdown(rule.globs.join(', '))}\`` : 'global',
      rule.reason,
    ].join(' | ')),
    '',
    report.caveat,
    '',
  ];
  return lines.join('\n');
}

export function renderExplainPretty(report: ContextExplanation): string {
  const targetLabel = report.target
    ? `${report.target.target} → ${report.target.path}`
    : report.targets.map((target) => target.target).join(', ');
  const lines = [
    'RuleSync Context Lens',
    `Input: ${report.input.path}`,
    `Target: ${targetLabel}`,
    '',
    'Rules:',
    ...report.rules.map((rule) => {
      const scope = rule.globs.length > 0 ? ` [${rule.globs.join(', ')}]` : '';
      return `  ${rule.status === 'applies' ? 'APPLIES' : 'EXCLUDED'}  ${rule.title} (line ${rule.line}) — ${rule.reason}${scope}`;
    }),
    '',
    `Summary: ${report.summary.applies} applies, ${report.summary.excluded} excluded, ${report.summary.total} total`,
    report.caveat,
    '',
  ];
  return lines.join('\n');
}

export function handleExplain(inputPath: string, options: ExplainOptions = {}): boolean {
  const cwd = options.cwd || process.cwd();
  const report = createContextExplanation(inputPath, options);
  const format = options.format || 'pretty';
  const content = format === 'json'
    ? renderExplainJson(report)
    : format === 'markdown'
      ? renderExplainMarkdown(report)
      : format === 'pretty'
        ? renderExplainPretty(report)
        : (() => { throw new Error(`Unsupported explanation format: ${format}`); })();

  if (options.output) {
    const outputPath = sanitizeWorkspacePath(options.output, cwd);
    const parentDir = path.dirname(outputPath);
    if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`Wrote ${format} context explanation: ${outputPath}`);
  } else {
    console.log(content);
  }
  return true;
}
