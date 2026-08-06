# RuleSync Product Specification & Architecture (v1.0.0)

## 1. Product Vision & Mission
`RuleSync` is an open-source CLI engine, static analyzer, and cross-format compiler for AI agent context instruction rules. It acts as the "ESLint & Babel for AI Agent Rules", allowing developers and engineering teams to maintain a single canonical source of truth (`AGENTS.md` or `.rulesync/`) and automatically compile, lint, optimize, and synchronize instructions across Cursor (`.cursor/rules/`), Anthropic Claude Code (`CLAUDE.md`), GitHub Copilot (`.github/copilot-instructions.md`), Cline / RooCode (`.cline/instructions.json`), Windsurf (`.windsurfrules`), and OpenCode.

---

## 2. Target Users & Use Cases

### User Personas
1. **Polyglot AI Developer**: Works across multiple tools (CLI agents like Claude Code/Gemini CLI alongside IDE extensions like Cursor and Copilot). Wants rules synchronized automatically without manual duplication.
2. **Open-Source Repository Maintainer**: Defines repository-wide architectural rules, testing guidelines, and security policies for community contributors using various AI coding assistants.
3. **Engineering Team Lead / DevSecOps**: Standardizes corporate security guardrails, forbidden packages, and code styling rules across engineering teams, verifying rule consistency in CI/CD pipelines.

---

## 3. Functional Requirements

### CLI Commands Matrix
| Command | Description | Flags |
|---|---|---|
| `rulesync init` | Interactively scans existing rule files, bootstraps `.rulesync/` configuration, and creates canonical `AGENTS.md` | `--force`, `--template <name>`, `--yes` |
| `rulesync lint` | Analyzes rules against static linter rules (duplicates, conflicts, token bloat, dangerous shell commands) | `--fix`, `--max-tokens <n>`, `--format <json\|pretty>` |
| `rulesync build` | Compiles source rules into all enabled target AI rule files | `--target <list>`, `--dry-run`, `--out-dir <dir>` |
| `rulesync check` | CI verification mode — checks if generated target files are up to date with source rules | `--quiet`, `--strict` |
| `rulesync watch` | File-system watcher mode — auto-compiles targets whenever source rule files change | `--debounce <ms>` |
| `rulesync diff` | Displays colorized diff preview between source rules and target compiled rule files | `--target <name>` |

---

## 4. Supported Target Adapters

1. **Cursor IDE (`cursor`)**:
   - Location: `.cursor/rules/*.mdc`
   - Format: Frontmatter globs (`globs: ["*.ts"]`, `alwaysApply: boolean`) + Markdown body.
2. **Anthropic Claude Code CLI (`claude`)**:
   - Location: `CLAUDE.md`
   - Format: Structured markdown sections with specific headings.
3. **GitHub Copilot (`copilot`)**:
   - Location: `.github/copilot-instructions.md`
   - Format: Structured markdown instructions.
4. **Cline / RooCode (`cline`)**:
   - Location: `.cline/instructions.json` or `.clinerules`
   - Format: JSON customInstructions structure or rule blocks.
5. **Windsurf (`windsurf`)**:
   - Location: `.windsurfrules`
   - Format: Bulleted markdown instructions.
6. **OpenCode / Standard (`agents`)**:
   - Location: `AGENTS.md`
   - Format: Standardized cross-agent markdown specification.

---

## 5. Static Linter Rules Matrix

| Rule ID | Severity | Description |
|---|---|---|
| `no-duplicate-rules` | Error | Detects duplicate or near-identical instructions across rules. |
| `no-contradictory-directives` | Error | Flags conflicting directives (e.g. `use type aliases` vs `use interfaces`). |
| `max-token-budget` | Warning | Warns when rule files exceed target token thresholds (> 2,000 tokens). |
| `require-glob-scope` | Warning | Encourages file glob scope annotations for language/framework specific rules. |
| `no-unsafe-commands` | Error | Identifies dangerous shell execution instructions (`rm -rf`, `curl \| bash`). |
| `no-secret-patterns` | Error | Detects accidentally hardcoded secrets or API tokens inside rule files. |
| `no-empty-rules` | Warning | Flags empty header sections with no rule body text. |

---

## 6. System Architecture

```
                  ┌────────────────────────────────────────┐
                  │ CLI Invocation (Commander / Clack UI)  │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │ Config & File Loader (.rulesync/rc)    │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │  Abstract Rule Tree (ART) Parser       │
                  │  - Markdown AST Parsing                │
                  │  - Comment & Metadata Extraction      │
                  └─────────┬────────────────────┬─────────┘
                            │                    │
                            ▼                    ▼
             ┌────────────────────────┐┌────────────────────────┐
             │ Linter Rule Engine     ││ Target Compiler Matrix │
             │ - AST Analysis         ││ - Cursor Adapter       │
             │ - Similarity Metric    ││ - Claude Code Adapter  │
             │ - Token Budgeting      ││ - Copilot Adapter      │
             │ - Security Sanitizer   ││ - Cline/Windsurf       │
             └────────────────────────┘└───────────┬────────────┘
                                                   │
                                                   ▼
                                       ┌────────────────────────┐
                                       │ Workspace File Writer  │
                                       │ - Safe Atomic Writes   │
                                       │ - Path Validation      │
                                       │ - Comment Header Tag   │
                                       └────────────────────────┘
```

---

## 7. Technology Stack Selection

* **Runtime**: Node.js >= 18 (Universal cross-platform support)
* **Language**: TypeScript 5.3 (Strict type safety, ES2022 output)
* **CLI UX**: Commander.js + Picocolors (Zero external bloat, sub-5ms boot time)
* **Build System**: Tsup / Esbuild (Single bundle CLI output + ESM/CJS exports)
* **Test Runner**: Vitest (Unit tests, compiler snapshots, linter matrix tests)
* **Distribution**: npm (`npx rulesync`), GitHub Releases binary, Homebrew formula template.

---

## 8. Security & Privacy Boundary
* **Path Traversal Shield**: All file read/write operations validate that target relative paths resolve exclusively inside `process.cwd()`. Writes attempting to escape workspace boundaries (`../..`) trigger an immediate runtime security exception.
* **100% Offline Execution**: Zero telemetry, zero external network requests, zero remote server dependencies.
* **Secret Redaction**: Rules containing pattern signatures matching API keys (`sk-ant-*`, `ghp_*`, `AKIA*`) are intercepted by `no-secret-patterns` linter rule.

---

## 9. Operating Cost
* **Total Operating Cost**: **$0.00**.

---

## 10. Non-Goals
* No LLM inference API dependencies required for execution.
* No IDE GUI app development (pure developer terminal CLI focus).
* No forced opinionated lock-in.

---

## 11. Acceptance Criteria for Release (v1.0.0)
1. Full test coverage (> 90%) across parser, linter, adapters, and CLI commands.
2. Production build compiles cleanly without TypeScript errors or warnings.
3. `rulesync init`, `lint`, `build`, `check`, `watch`, and `diff` operate seamlessly on Linux, macOS, and Windows environments.
4. Comprehensive developer documentation, quickstart guide, visual terminal diagrams, and contribution rules.
