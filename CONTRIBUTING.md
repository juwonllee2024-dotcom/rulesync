# Contributing to RuleSync

Thank you for your interest in contributing to `RuleSync`! We welcome contributions from developers of all skill levels.

---

## 🚀 Quickstart Development Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/rulesync/rulesync.git
   cd rulesync
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Typecheck & Tests**:
   ```bash
   npm run typecheck
   npm test
   ```

4. **Run Local CLI**:
   ```bash
   npx tsx src/cli.ts --help
   ```

---

## 🎯 How to Add a New Target Adapter

Adding support for a new AI agent rule format (e.g. AWS Q, Zed, Cursor multi-file rules) is easy:

1. Create a new adapter file in `src/compiler/adapters/<target-name>.ts`.
2. Implement the compiler function conforming to the `CompiledOutput` interface:
   ```typescript
   import { AbstractRuleTree, CompiledOutput } from '../../types/index.js';

   export function compileMyTarget(art: AbstractRuleTree, headerComment = true): CompiledOutput {
     // ... transform Abstract Rule Tree to target rule format
     return {
       target: 'mytarget' as any,
       relativePath: '.mytarget/rules.md',
       content: '...'
     };
   }
   ```
3. Register the new target adapter in `src/compiler/matrix.ts`.
4. Add unit test coverage in `tests/compiler.test.ts`.
5. Update `SPECIFICATION.md` and `README.md`.

---

## 🧪 Adding a New Static Linter Rule

1. Create a new linter rule in `src/linter/rules/<ruleName>.ts`.
2. Implement the `LinterRule` interface:
   ```typescript
   import { LinterRule, LintIssue } from '../../types/index.js';

   export const myNewRule: LinterRule = {
     id: 'my-new-rule' as any,
     description: 'Description of what this linter rule catches',
     run(art, config) {
       const issues: LintIssue[] = [];
       // ... scan ART and push issues
       return issues;
     }
   };
   ```
3. Register the rule in `ALL_LINTER_RULES` array in `src/linter/engine.ts`.
4. Add test cases in `tests/linter.test.ts`.

---

## 📋 Pull Request Checklist

Before submitting a Pull Request, please ensure:

- [ ] All unit tests pass (`npm test`).
- [ ] TypeScript types compile without errors (`npm run typecheck`).
- [ ] Production build succeeds (`npm run build`).
- [ ] Code formatting and style follow project conventions.
- [ ] New features or fixes include corresponding unit tests.
