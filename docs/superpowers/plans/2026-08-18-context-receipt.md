# Context Receipt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a deterministic `rulesync receipt` command that fingerprints canonical and compiled agent context, reports drift, and produces JSON/Markdown/HTML audit artifacts.

**Architecture:** Reuse `loadConfig`, `parseMarkdownToART`, `runLinter`, and `compileToTargets`. A focused receipt module reads bytes, computes hashes, compares expected target output with disk, and owns renderers. Commander wires the command without changing existing build behavior.

**Tech Stack:** TypeScript, Node `crypto`/`fs`/`path`, Commander, Vitest, existing tsup build.

**Spec:** `docs/superpowers/specs/2026-08-18-context-receipt-design.md`

## Global Constraints

- Runtime supports Node `>=18.0.0` and adds no runtime dependency.
- Receipt generation makes no network calls, model calls, shell calls, or source/target mutations.
- Every path must pass `sanitizeWorkspacePath`; output writes only to explicit `--output`.
- Tests follow RED → GREEN → REFACTOR; no production behavior without a failing test first.
- Hashes use SHA-256 over file bytes; token estimate is deterministic `ceil(nonWhitespaceCharacters / 4)`.
- Existing commands and public API remain backward compatible.

---

### Task 1: Cross-platform workspace boundary

**Files:**
- Modify: `tests/security.test.ts`
- Modify: `src/utils/path.ts`

**Interfaces:**
- Preserve `sanitizeWorkspacePath(targetPath: string, rootDir?: string): string`.
- Preserve `normalizeRelativePath(filePath: string, rootDir?: string): string`.

- [ ] **Step 1: Add the sibling-prefix regression test**

Add a test asserting `../workspace-evil/file.md` is rejected when the root is `/home/user/workspace`, while existing POSIX fixture paths remain unchanged.

- [ ] **Step 2: Run the focused test and verify RED**

Run `npm test -- tests/security.test.ts`. Expected: current Windows path resolution fails the POSIX fixture and does not yet provide the robust boundary behavior.

- [ ] **Step 3: Implement minimal platform-aware resolution**

Select `path.posix` when `rootDir` starts with `/`, otherwise the native `path` API. Compare the target against `root + separator` so `/workspace-evil` cannot pass a `/workspace` prefix check.

- [ ] **Step 4: Run focused and full tests**

Run `npm test -- tests/security.test.ts` then `npm test`. Expected: all security and existing tests pass.

- [ ] **Step 5: Commit the baseline fix**

```bash
git add tests/security.test.ts src/utils/path.ts
git commit -m "fix: make workspace guards cross-platform"
```

### Task 2: Receipt contract and core audit

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/receipt/index.ts`
- Create: `tests/receipt.test.ts`

**Interfaces:**
- Export `ContextReceipt`, `ReceiptTarget`, and `ReceiptFormat` from `src/types/index.ts`.
- Export `createContextReceipt(cwd: string, generatedAt?: string): ContextReceipt`.
- Export `receiptIsSynced(receipt: ContextReceipt): boolean`.

- [ ] **Step 1: Write failing core tests**

Create a temporary workspace with `AGENTS.md`, `.rulesync/config.json`, and one generated target. Assert receipt fields, deterministic context ID for fixed input, `synced` status, `missing` status after deleting a target, and `drifted` after changing a target.

- [ ] **Step 2: Run receipt tests and verify RED**

Run `npm test -- tests/receipt.test.ts`. Expected: module/function is missing, not a test typo.

- [ ] **Step 3: Implement minimal receipt assembly**

Load config, parse/lint/compile in memory, hash source and expected output bytes, read actual target bytes when present, calculate token estimates, and derive the 12-character context ID from stable JSON without `generatedAt`.

- [ ] **Step 4: Run receipt tests and full suite**

Run `npm test -- tests/receipt.test.ts` then `npm test`. Expected: receipt tests and all prior tests pass.

### Task 3: Renderers and CLI command

**Files:**
- Modify: `src/cli.ts`
- Modify: `src/index.ts`
- Modify: `src/receipt/index.ts`
- Create: `src/receipt/render.ts`
- Modify: `tests/receipt.test.ts`

**Interfaces:**
- Export `handleReceipt(options: { format?: ReceiptFormat; output?: string; check?: boolean; cwd?: string }): Promise<boolean>`.
- Export `renderReceiptJson`, `renderReceiptMarkdown`, and `renderReceiptHtml`.

- [ ] **Step 1: Add renderer and handler tests**

Assert JSON parses, Markdown contains context ID/status/hash, HTML escapes `<script>` in a path, output is written only to requested file, and `check` returns false for drift.

- [ ] **Step 2: Run focused tests and verify RED**

Run `npm test -- tests/receipt.test.ts`. Expected: renderer and handler exports are missing.

- [ ] **Step 3: Implement escaped renderers and Commander wiring**

Default to Markdown on stdout when no output is supplied. Use `--format json|markdown|html`, `--output <path>`, and `--check`; call `process.exit(1)` only from the command action when handler returns false.

- [ ] **Step 4: Run tests and CLI smoke commands**

Run `npm test`, `npm run typecheck`, and `npm run build`. Then run `node dist/cli.js receipt --help` and a temporary workspace command for each format.

### Task 4: Documentation and verification record

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Create: `docs/verification/context-receipt-v1.1.md`
- Modify: `.github/workflows/ci.yml` only if current action/runtime check requires it.

- [ ] **Step 1: Update README with the one-minute receipt demo**

Document `rulesync receipt --format html --output .rulesync/context-receipt.html`, the JSON contract, `--check`, status meanings, and explicit limits.

- [ ] **Step 2: Record real execution evidence**

Save commands, output summaries, context ID, test count, package smoke result, `npm audit --omit=dev`, and `git diff --check` results in the verification record. Use synthetic rules only.

- [ ] **Step 3: Run release gates**

Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm audit --omit=dev`, `npm pack --dry-run`, and `git diff --check`.

### Task 5: Publish

**Files:**
- Git history and GitHub branch/release.

- [ ] **Step 1: Inspect diff and staged secret patterns**

Run `git status --short`, `git diff --check`, and a targeted search for private keys, API-key prefixes, and real personal data.

- [ ] **Step 2: Commit intended changes**

```bash
git add src tests README.md CHANGELOG.md docs .github
git commit -m "feat: add agent context receipts"
```

- [ ] **Step 3: Push branch and open draft PR**

Push `agent/context-lock` and open a draft PR into `main` with summary, motivation, checks, and safety boundary.

- [ ] **Step 4: Publish release only after CI is green**

After GitHub Actions passes, create or update the appropriate release/tag with verification record and report the PR/release URLs.
