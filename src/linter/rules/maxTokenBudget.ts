import { LinterRule, LintIssue } from '../../types/index.js';

export const maxTokenBudget: LinterRule = {
  id: 'max-token-budget',
  description: 'Warns when rule set exceeds token thresholds',
  run(art, config) {
    const issues: LintIssue[] = [];
    const maxAllowed = config?.maxTokens || 2000;

    // Estimate ~4 characters per token
    const charCount = art.rawMarkdown.length;
    const estimatedTokens = Math.ceil(charCount / 4);

    if (estimatedTokens > maxAllowed) {
      issues.push({
        ruleId: 'global',
        code: 'max-token-budget',
        severity: 'warn',
        message: `Total rule set size (~${estimatedTokens} tokens) exceeds configured budget limit of ${maxAllowed} tokens.`,
        suggestion: 'Trim redundant explanations, split file-specific rules using globs, or simplify formatting.',
      });
    }

    return issues;
  },
};
