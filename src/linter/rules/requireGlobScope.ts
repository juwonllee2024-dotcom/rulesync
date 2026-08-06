import { LinterRule, LintIssue } from '../../types/index.js';

const FILE_TECH_KEYWORDS = [
  'react',
  'vue',
  'svelte',
  'angular',
  'nextjs',
  'express',
  'python',
  'rust',
  'golang',
  'typescript',
  'docker',
  'sql',
  'graphql',
  'css',
  'tailwindcss',
];

export const requireGlobScope: LinterRule = {
  id: 'require-glob-scope',
  description: 'Recommends file globs for tech-specific rules',
  run(art) {
    const issues: LintIssue[] = [];

    for (const rule of art.rules) {
      if (rule.metadata.globs && rule.metadata.globs.length > 0) continue;

      const lower = rule.content.toLowerCase();
      const matchedTech = FILE_TECH_KEYWORDS.find(tech => lower.includes(tech));

      if (matchedTech) {
        issues.push({
          ruleId: rule.metadata.id,
          code: 'require-glob-scope',
          severity: 'warn',
          message: `Rule "${rule.metadata.title}" references technology "${matchedTech}" but lacks a file glob constraint.`,
          line: rule.line,
          suggestion: `Add file globs comment annotation, e.g. \`<!-- globs: **/*.${matchedTech === 'typescript' ? 'ts' : 'js'} -->\`.`,
        });
      }
    }

    return issues;
  },
};
