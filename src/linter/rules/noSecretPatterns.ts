import { LinterRule, LintIssue } from '../../types/index.js';

const SECRET_PATTERNS = [
  { pattern: /sk-ant-api[a-zA-Z0-9_\-]{20,}/, name: 'Anthropic API key' },
  { pattern: /sk-proj-[a-zA-Z0-9_\-]{20,}/, name: 'OpenAI Project API key' },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, name: 'GitHub Personal Access Token' },
  { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key ID' },
  { pattern: /AIzaSy[a-zA-Z0-9_\-]{33}/, name: 'Google API Key' },
  { pattern: /xox[baprs]-[a-zA-Z0-9_\-]{10,}/, name: 'Slack Token' },
];

export const noSecretPatterns: LinterRule = {
  id: 'no-secret-patterns',
  description: 'Flags API keys or credentials embedded in rule files',
  run(art) {
    const issues: LintIssue[] = [];

    for (const rule of art.rules) {
      for (const secret of SECRET_PATTERNS) {
        if (secret.pattern.test(rule.content)) {
          issues.push({
            ruleId: rule.metadata.id,
            code: 'no-secret-patterns',
            severity: 'error',
            message: `Rule "${rule.metadata.title}" contains a hardcoded ${secret.name}.`,
            line: rule.line,
            suggestion: 'Remove API secret keys immediately and reference environment variables instead.',
            fixable: true,
          });
        }
      }
    }

    return issues;
  },
};
