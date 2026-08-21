# Context Lens v1.2.0 verification record

Date: 2026-08-21 (America/Los_Angeles)

## Real execution

Input: this repository's canonical `AGENTS.md`, configured targets, and the workspace-relative path `src/cli.ts`.

```text
node dist/cli.js explain src/cli.ts --target cursor --format markdown

Summary: 2 applies · 1 excluded · 3 total
Code Style & Standards: applies, glob-match
Testing & Quality: excluded, glob-miss
Security & Privacy Guidelines: applies, unscoped
```

The JSON and Markdown reports expose rule names, source lines, scopes, statuses, and reasons. They do not print rule bodies. The report explicitly says it is a static scope prediction and does not prove provider runtime loading or compliance.

## TDD evidence

- RED: focused `tests/explain.test.ts` failed because `src/explain/index.js` did not exist.
- GREEN: focused suite passed 4/4 after the minimal Context Lens implementation.
- Regression coverage includes glob matches and misses, Windows path normalization, workspace traversal blocking, review-safe Markdown, and JSON output.

## Release gates

| Gate | Result |
| --- | --- |
| `npm test` | PASS — 7 files, 28 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — CJS, ESM, declarations |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm pack --dry-run` | PASS — `rulesync-1.2.0.tgz` |
| Release tarball package smoke | PASS — installed tarball reports `1.2.0` and runs `explain` |
| `git diff --check` | PASS |

Local tarball SHA-256: `438eb2919ba1251ab8f72f22c2f58f88bcd6e3952999014267dc9306b93ba4a6`.

## Distribution boundary

The public npm package named `rulesync` currently resolves to `dyoshikawa/rulesync` v16.14.0, not this repository. v1.2.0 therefore ships a verified GitHub Release tarball for explicit installation; npm publication remains unavailable without an owner-controlled npm token.
