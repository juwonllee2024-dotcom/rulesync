import { LinterRule, LintIssue } from '../../types/index.js';

interface ContradictionPair {
  name: string;
  patternA: RegExp;
  patternB: RegExp;
  descA: string;
  descB: string;
}

const CONTRADICTIONS: ContradictionPair[] = [
  {
    name: 'Type Alias vs Interface',
    patternA: /\balways use type aliases?\b|\bprefer type over interface\b/i,
    patternB: /\balways use interfaces?\b|\bprefer interface over type\b/i,
    descA: 'prefer type aliases',
    descB: 'prefer interfaces',
  },
  {
    name: 'Tabs vs Spaces',
    patternA: /\balways use tabs\b|\btab indentation\b/i,
    patternB: /\balways use spaces\b|\bspace indentation\b/i,
    descA: 'use tabs',
    descB: 'use spaces',
  },
  {
    name: 'Semicolons',
    patternA: /\balways use semicolons?\b|\bnever omit semicolons?\b/i,
    patternB: /\bno semicolons?\b|\bnever use semicolons?\b|\bomit semicolons?\b/i,
    descA: 'require semicolons',
    descB: 'omit semicolons',
  },
  {
    name: 'Default Export vs Named Export',
    patternA: /\balways use named exports?\b|\bno default exports?\b/i,
    patternB: /\balways use default exports?\b|\bprefer default exports?\b/i,
    descA: 'use named exports',
    descB: 'use default exports',
  },
];

export const noContradictoryDirectives: LinterRule = {
  id: 'no-contradictory-directives',
  description: 'Flags contradictory directives across rules',
  run(art) {
    const issues: LintIssue[] = [];

    for (const rule of art.rules) {
      for (const pair of CONTRADICTIONS) {
        const matchesA = pair.patternA.test(rule.content);
        const matchesB = pair.patternB.test(rule.content);

        if (matchesA && matchesB) {
          issues.push({
            ruleId: rule.metadata.id,
            code: 'no-contradictory-directives',
            severity: 'error',
            message: `Rule "${rule.metadata.title}" contains contradictory directives (${pair.descA} vs ${pair.descB}).`,
            line: rule.line,
            suggestion: `Choose one consistent guideline for ${pair.name}.`,
          });
        }
      }
    }

    return issues;
  },
};
