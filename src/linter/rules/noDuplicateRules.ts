import { LinterRule, LintIssue } from '../../types/index.js';

export const noDuplicateRules: LinterRule = {
  id: 'no-duplicate-rules',
  description: 'Detects duplicate or near-identical rule directives',
  run(art) {
    const issues: LintIssue[] = [];
    const seen = new Map<string, { id: string; title: string; line: number }>();

    for (const rule of art.rules) {
      if (!rule.content) continue;

      const normalized = rule.content
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();

      if (!normalized) continue;

      if (seen.has(normalized)) {
        const original = seen.get(normalized)!;
        issues.push({
          ruleId: rule.metadata.id,
          code: 'no-duplicate-rules',
          severity: 'error',
          message: `Rule "${rule.metadata.title}" has identical content to rule "${original.title}" (line ${original.line}).`,
          line: rule.line,
          suggestion: 'Consolidate duplicate rules into a single directive section.',
          fixable: true,
        });
      } else {
        seen.set(normalized, { id: rule.metadata.id, title: rule.metadata.title, line: rule.line });
      }
    }

    return issues;
  },
};
