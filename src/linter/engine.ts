/**
 * RuleSync Static Linter Engine
 */

import { AbstractRuleTree, LintResult, LinterRule, RuleSyncConfig } from '../types/index.js';
import { noDuplicateRules } from './rules/noDuplicateRules.js';
import { noContradictoryDirectives } from './rules/noContradictoryDirectives.js';
import { maxTokenBudget } from './rules/maxTokenBudget.js';
import { requireGlobScope } from './rules/requireGlobScope.js';
import { noUnsafeCommands } from './rules/noUnsafeCommands.js';
import { noSecretPatterns } from './rules/noSecretPatterns.js';
import { noEmptyRules } from './rules/noEmptyRules.js';

export const ALL_LINTER_RULES: LinterRule[] = [
  noDuplicateRules,
  noContradictoryDirectives,
  maxTokenBudget,
  requireGlobScope,
  noUnsafeCommands,
  noSecretPatterns,
  noEmptyRules,
];

export function runLinter(art: AbstractRuleTree, config?: RuleSyncConfig): LintResult {
  const issues = [];
  const ignoredSet = new Set(config?.ignoreRules || []);

  const activeRules = ALL_LINTER_RULES.filter(r => !ignoredSet.has(r.id));

  for (const rule of activeRules) {
    const ruleIssues = rule.run(art, config);
    issues.push(...ruleIssues);
  }

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warn').length;
  const tokenCount = Math.ceil(art.rawMarkdown.length / 4);

  return {
    filePath: art.filePath || 'AGENTS.md',
    issues,
    errorCount,
    warningCount,
    tokenCount,
  };
}
