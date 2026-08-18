# Context Receipt Design

## Problem

RuleSync already compiles one canonical rule source into several agent-specific files and can tell whether those files are synchronized. A maintainer still cannot answer quickly, “What exact instruction bundle did this agent target receive?” A stale file, a changed target adapter, or a different branch can silently change agent behavior.

## Product decision

Add `rulesync receipt`, a local, deterministic audit artifact for the compiled agent context. It reads the canonical source and configuration, compiles target output in memory, hashes the canonical source and every expected/on-disk target, and emits a short context ID plus per-target status.

The receipt is a fingerprint and review surface, not a new source of rules. The target files remain the source of truth for each tool; the receipt proves which bytes were expected and whether disk matches them.

## User flow

```text
AGENTS.md + .rulesync/config.json
              ↓
rulesync receipt --format html --output .rulesync/context-receipt.html
              ↓
context ID · target status · hashes · token/byte counts
```

CI can use `rulesync receipt --check --format json`. It exits non-zero when a compiled target is missing, drifted, or blocked by a linter error. Normal receipt generation never writes source or target files; it writes only the explicit output path.

## Data contract

```ts
interface ContextReceipt {
  schemaVersion: 1;
  generatedAt: string;
  source: { path: string; sha256: string; bytes: number; tokenEstimate: number };
  contextId: string;
  targets: Array<{
    target: TargetAdapterName;
    path: string;
    status: 'synced' | 'missing' | 'drifted';
    expectedSha256: string;
    actualSha256?: string;
    bytes: number;
    tokenEstimate: number;
  }>;
  summary: { synced: number; missing: number; drifted: number; total: number };
}
```

`contextId` is the first 12 hexadecimal characters of SHA-256 over the canonical source hash, target names, and expected target hashes. The same input produces the same ID; `generatedAt` is metadata only.

## Formats

- JSON: stable machine-readable contract for CI and tooling.
- Markdown: concise ledger for pull requests and issue comments.
- HTML: escaped, standalone, searchable card with clear green/yellow/red target status.

## Safety and boundaries

- No network calls, model calls, shell execution, telemetry, or package installation at runtime.
- No source or target mutation during receipt generation.
- Output paths use the existing workspace boundary guard.
- Hashes are computed from bytes; no secret contents are printed.
- Existing linter errors block receipt creation and `--check` returns failure.
- `--check` is the only mode that uses process exit status for drift; normal output remains reviewable.

## Non-goals for v1.1

- No lockfile replacement for package managers.
- No claim that a hash proves an agent actually loaded a file at runtime.
- No remote dashboard, account, or hosted receipt registry.
- No automatic repair; users run the existing `rulesync build` after reviewing drift.

## Acceptance criteria

1. POSIX-style paths behave consistently on Windows and Unix, including traversal and sibling-prefix guards.
2. `rulesync receipt` emits all three formats from a temporary workspace.
3. Missing and drifted target files are distinguished with hashes.
4. `--check` returns false for missing/drifted targets and true for synced targets.
5. HTML and Markdown escape untrusted rule titles and paths.
6. Existing test suite, typecheck, lint, build, audit, and package smoke test pass.
