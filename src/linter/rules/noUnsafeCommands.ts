import { LinterRule, LintIssue } from '../../types/index.js';

const UNSAFE_PATTERNS = [
  { pattern: /rm\s+-rf\s+[\/\~]/i, desc: 'destructive root/home directory deletion (rm -rf /)' },
  { pattern: /curl\s+.*\s*\|\s*bash/i, desc: 'unvetted piping from remote URL into bash (curl | bash)' },
  { pattern: /wget\s+.*\s*\|\s*sh/i, desc: 'unvetted piping from remote URL into sh (wget | sh)' },
  { pattern: /chmod\s+777/i, desc: 'overly permissive file permissions (chmod 777)' },
  { pattern: /sudo\s+rm/i, desc: 'privileged file deletion (sudo rm)' },
  { pattern: /git\s+push\s+.*--force/i, desc: 'force pushing git branches without protection' },
];

const NEGATIVE_PREFIXES = /\b(do not|never|avoid|forbidden|prohibit|don't|shall not)\b/i;

export const noUnsafeCommands: LinterRule = {
  id: 'no-unsafe-commands',
  description: 'Detects dangerous command auto-execution instructions',
  run(art) {
    const issues: LintIssue[] = [];

    for (const rule of art.rules) {
      const lines = rule.content.split('\n');
      for (let l = 0; l < lines.length; l++) {
        const lineText = lines[l];
        // If line is explicit negative directive ("Do not execute...", "Never run..."), skip
        if (NEGATIVE_PREFIXES.test(lineText)) {
          continue;
        }

        for (const unsafe of UNSAFE_PATTERNS) {
          if (unsafe.pattern.test(lineText)) {
            issues.push({
              ruleId: rule.metadata.id,
              code: 'no-unsafe-commands',
              severity: 'error',
              message: `Rule "${rule.metadata.title}" contains unsafe command directive: ${unsafe.desc}.`,
              line: rule.line + l,
              suggestion: 'Remove dangerous command directives or prefix with explicit prohibition (e.g. "Do not execute...").',
            });
          }
        }
      }
    }

    return issues;
  },
};
