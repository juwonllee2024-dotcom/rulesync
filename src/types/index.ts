/**
 * Core Type Definitions for RuleSync
 */

export interface RuleMetadata {
  id: string;
  title: string;
  description?: string;
  globs?: string[];
  tools?: string[];
  severity?: 'error' | 'warn' | 'info';
  category?: 'style' | 'security' | 'architecture' | 'workflow' | 'testing';
  tags?: string[];
  alwaysApply?: boolean;
}

export interface RuleNode {
  metadata: RuleMetadata;
  content: string;
  rawSource: string;
  line: number;
}

export interface AbstractRuleTree {
  title: string;
  overview?: string;
  globalGlobs?: string[];
  rules: RuleNode[];
  rawMarkdown: string;
  filePath?: string;
}

export type LintCode =
  | 'no-duplicate-rules'
  | 'no-contradictory-directives'
  | 'max-token-budget'
  | 'require-glob-scope'
  | 'no-unsafe-commands'
  | 'no-secret-patterns'
  | 'no-empty-rules';

export interface LintIssue {
  ruleId: string;
  code: LintCode;
  severity: 'error' | 'warn';
  message: string;
  line?: number;
  suggestion?: string;
  fixable?: boolean;
}

export interface LintResult {
  filePath: string;
  issues: LintIssue[];
  errorCount: number;
  warningCount: number;
  tokenCount: number;
}

export type TargetAdapterName = 'claude' | 'cursor' | 'copilot' | 'cline' | 'windsurf' | 'agents';

export interface CompiledOutput {
  target: TargetAdapterName;
  relativePath: string;
  content: string;
}

export interface RuleSyncConfig {
  source: string; // e.g. "AGENTS.md" or ".rulesync/rules/"
  targets: TargetAdapterName[];
  outDir?: string;
  maxTokens?: number;
  ignoreRules?: LintCode[];
  headerComment?: boolean;
}

export interface LinterRule {
  id: LintCode;
  description: string;
  run: (art: AbstractRuleTree, config?: RuleSyncConfig) => LintIssue[];
}
