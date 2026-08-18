# Context Receipt v1.1 verification record

Date: 2026-08-18 (America/Los_Angeles)

## Real execution

Input: this repository’s canonical `AGENTS.md` and configured five targets.

```text
node dist/cli.js receipt --format json --output docs/verification/context-receipt.json
Wrote json context receipt: .../docs/verification/context-receipt.json

Context ID: 4f1e5284fd95
Source SHA-256: 78920552cda1bfb495779bc46a85e3dae491da2b1d8edd2eba5b0d81265b7387
Targets: 5
Synced: 5
Missing: 0
Drifted: 0
```

The first receipt run intentionally detected all five existing target files as `DRIFTED`. Running the existing `rulesync build` regenerated them; a second receipt run and `receipt --check` reported 5/5 synced. This proves the receipt can surface real repository drift instead of assuming green status.

Generated artifacts:

- `context-receipt.json` — machine-readable evidence.
- `context-receipt.md` — pull-request-friendly ledger.
- `context-receipt.html` — standalone, searchable review card.

## TDD evidence

- Path guard RED: the focused security suite failed on Windows POSIX fixtures and allowed a sibling-prefix path.
- Path guard GREEN: `tests/security.test.ts` passed 3/3 after platform-aware resolution and separator-boundary checks.
- Receipt RED: focused suite failed because `src/receipt/index.ts` did not exist.
- Receipt GREEN: focused suite passed 4/4; full suite passed 24/24.
- Drift regression covers both `missing` and `drifted` target states.

## Release gates

| Gate | Result |
| --- | --- |
| `npm test` | PASS — 6 files, 24 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — CJS, ESM, declarations |
| `npm audit` | PASS — 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm pack --dry-run` | PASS — `rulesync-1.1.0.tgz` |
| `node dist/cli.js receipt --check ...` | PASS — 5 synced |
| `git diff --check` | PASS before publish |

## Security notes

- Receipt hashes bytes and does not print rule contents.
- HTML/Markdown renderers escape target paths and metadata.
- Output writes only to the explicit workspace-contained path.
- Runtime receipt flow has no network, model, shell, telemetry, or installation behavior.
- Dev audit vulnerabilities from Vitest 1.x were removed by upgrading to Vitest 3.2.6 and overriding vulnerable transitive `esbuild`/`nanoid` ranges; Node 18 compatibility remains in CI.
