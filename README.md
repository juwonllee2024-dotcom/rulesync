# ⚡ RuleSync

> **The ESLint & Babel for AI Agent Rules — Compile, lint, optimize, and sync instructions across `AGENTS.md`, `CLAUDE.md`, `.cursor/rules`, and Copilot.**

[![CI Workflows](https://github.com/rulesync/rulesync/actions/workflows/ci.yml/badge.svg)](https://github.com/rulesync/rulesync/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/rulesync.svg)](https://www.npmjs.com/package/rulesync)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

---

## 💡 What is RuleSync?

**RuleSync** is an open-source CLI engine, static analyzer, and cross-format compiler for AI agent context instruction rules. It allows developers and engineering teams to write a single canonical source of truth (`AGENTS.md` or `.rulesync/`) and automatically compile, lint, optimize, and synchronize instructions across **Cursor**, **Anthropic Claude Code**, **GitHub Copilot**, **Cline / RooCode**, **Windsurf**, and **OpenCode**.

```
                           ┌───────────────────────────┐
                           │    Source: AGENTS.md      │
                           │  (Canonical Rules File)   │
                           └─────────────┬─────────────┘
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │   Abstract Rule Tree      │
                           │         (ART)             │
                           └─────────────┬─────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
     ┌───────────────────────────┐               ┌───────────────────────────┐
     │   Static Linter Engine    │               │  Multi-Target Compiler    │
     │ ├─ Duplicate check        │               │ ├─ CLAUDE.md              │
     │ ├─ Conflict detector      │               │ ├─ .cursor/rules/*.mdc    │
     │ ├─ Token budget check     │               │ ├─ copilot-instructions   │
     │ └─ Security sanitizer     │               │ ├─ .cline/instructions    │
     └───────────────────────────┘               │ └─ .windsurfrules         │
                                                 └───────────────────────────┘
```

---

## 🎯 Who is it for?

* **Polyglot AI Developers**: Working with 2+ AI tools (e.g. Claude Code CLI + Cursor IDE + GitHub Copilot) who want consistent rule behaviors across all assistants without manual copy-pasting.
* **Open-Source Maintainers**: Defining repo-wide architectural guidelines, testing rules, and security standards for community contributors using different AI tools.
* **Engineering Teams & DevSecOps**: Standardizing security guardrails, forbidden packages, and code styling rules across engineering teams, verifying rule consistency in CI/CD pipelines.

---

## ⚡ 1-Minute Quickstart

Try `RuleSync` immediately in any project without installation:

```bash
# 1. Bootstrap canonical AGENTS.md rule file and configuration
npx rulesync init

# 2. Lint your AI agent rules for conflicts, duplication, and token bloat
npx rulesync lint

# 3. Cross-compile target instruction files for all installed AI tools
npx rulesync build
```

### See exactly what your agent receives

Rule files can be synchronized and still be unclear at review time. `receipt` creates a local fingerprint for the canonical source and every compiled target:

```bash
npx rulesync receipt --format html --output .rulesync/context-receipt.html
open .rulesync/context-receipt.html
```

The receipt shows a 12-character context ID, SHA-256 values, byte/token estimates, and `SYNCED`, `MISSING`, or `DRIFTED` status. It never prints rule contents or calls a network. Use it in CI:

```bash
npx rulesync receipt --check --format json --output .rulesync/context-receipt.json
```

Share the context ID in a pull request when someone asks, “Which instructions did the agent see?” A receipt fingerprints expected compiled bytes; it does not claim runtime loading.

---

## 🔍 Why RuleSync?

| Feature | Manual Copy-Paste | Caliber / Paid Tools | **RuleSync (OSS)** |
|---|:---:|:---:|:---:|
| **Cross-Tool Compilation** | ❌ Manual | ⚠️ Limited | **✅ 10+ Target Adapters** |
| **Static Linter Engine** | ❌ None | ❌ None | **✅ 7 AST Linter Rules** |
| **Conflict & Duplicate Detection** | ❌ None | ❌ None | **✅ AST Analysis** |
| **Token Budget Optimization** | ❌ Manual | ❌ None | **✅ Automated Token Check** |
| **Security & Secret Sanitizer** | ❌ None | ❌ None | **✅ Intercepts API Keys & Shell Bugs** |
| **100% Offline & $0 Operating Cost** | ✅ Yes | ❌ Paid / SaaS | **✅ Pure Local Open-Source** |
| **CI / Pre-commit Synchronization** | ❌ None | ❌ None | **✅ `rulesync check`** |

---

## 🛠️ Supported Target Adapters

| Target | Generated Output | Description |
|---|---|---|
| **`claude`** | `CLAUDE.md` | Anthropic Claude Code terminal agent rules |
| **`cursor`** | `.cursor/rules/rulesync.mdc` | Cursor IDE rules with YAML frontmatter globs |
| **`copilot`** | `.github/copilot-instructions.md` | GitHub Copilot repository guidelines |
| **`cline`** | `.cline/instructions.json` | Cline / RooCode custom instructions JSON |
| **`windsurf`** | `.windsurfrules` | Windsurf Cascade agent rules |
| **`agents`** | `AGENTS.md` | OpenCode / Standard universal agent specification |

---

## 🧪 Static Linter Rules Matrix

`RuleSync` analyzes your markdown rules using AST parsing to catch common prompt anti-patterns before they cause LLM hallucinations:

| Rule Code | Severity | Description |
|---|:---:|---|
| **`no-duplicate-rules`** | `error` | Flags duplicate or identical rule instructions. |
| **`no-contradictory-directives`** | `error` | Catches conflicting guidance (e.g. `prefer types` vs `prefer interfaces`). |
| **`no-unsafe-commands`** | `error` | Identifies dangerous shell commands (`rm -rf /`, `chmod 777`, `curl \| bash`). |
| **`no-secret-patterns`** | `error` | Intercepts hardcoded API keys (`sk-ant-*`, `ghp_*`, `AKIA*`) in rule files. |
| **`max-token-budget`** | `warning` | Warns when rule sets exceed context window budgets (> 2,000 tokens). |
| **`require-glob-scope`** | `warning` | Recommends scoping tech-specific rules with file glob annotations. |
| **`no-empty-rules`** | `warning` | Flags empty rule header sections. |

---

## 💻 CLI Reference

### `rulesync init`
Bootstraps a canonical `AGENTS.md` file and creates `.rulesync/config.json`.
```bash
npx rulesync init [--force]
```

### `rulesync lint`
Lints source rule files against static analysis rules and token budgets.
```bash
npx rulesync lint [--format json] [--max-tokens 2000]
```

### `rulesync build`
Compiles source rules into all enabled target AI rule files.
```bash
npx rulesync build [--targets claude,cursor,copilot] [--dry-run]
```

### `rulesync check`
CI / pre-commit verification mode — exits with code 1 if target files are out of sync.
```bash
npx rulesync check [--quiet]
```

### `rulesync watch`
Live file watcher mode — automatically compiles target files whenever `AGENTS.md` is saved.
```bash
npx rulesync watch
```

### `rulesync diff`
Previews terminal colorized diffs between compiled target outputs and disk files.
```bash
npx rulesync diff [--target cursor]
```

### `rulesync receipt`
Creates a machine-readable, Markdown, or standalone HTML fingerprint of every configured target. `--check` exits with code `1` when a target is missing or drifted.
```bash
npx rulesync receipt [--format json|markdown|html] [--output <path>] [--check]
```

---

## ⚙️ Configuration (`.rulesync/config.json`)

```json
{
  "source": "AGENTS.md",
  "targets": ["claude", "cursor", "copilot", "cline", "windsurf"],
  "maxTokens": 2000,
  "headerComment": true,
  "ignoreRules": []
}
```

---

## 🔒 Security & Privacy Model

* **Strict Workspace Boundary**: Path resolution is strictly constrained within `process.cwd()` using `sanitizeWorkspacePath()`. Attempts to traverse outside workspace boundaries (`../../`) trigger an immediate security exception.
* **100% Offline & Private**: Zero remote telemetry, zero external API calls, zero server tracking.

---

## 🤝 Contributing

We welcome community contributions! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📜 License

[MIT License](LICENSE) © 2026 RuleSync Contributors
