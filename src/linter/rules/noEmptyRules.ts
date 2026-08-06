import { LinterRule, LintIssue } from '../../types/index.js';

export const noEmptyRules: LinterRule = {
  id: 'no-empty-rules',
  description: 'Flags header sections with no rule content',
  run(art) {
    const issues: LintIssue[] = [];

    for (const rule of art.rules) {
      if (!rule.content || rule.content.trim().length === 0) {
        issues.push({
          ruleId: rule.metadata.id,
          code: 'no-empty-rules',
          severity: 'warn',
          message: `Rule section "${rule.metadata.title}" is empty and contains no directive content.`,
          line: rule.line,
          suggestion: 'Add directive content to the rule section or remove the empty header.',
        });
      }
    }

    return issues;
  },
};
