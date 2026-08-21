# Changelog

All notable changes to `RuleSync` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-08-21

### Added

- `rulesync explain <path>` (Context Lens) predicts which canonical rules apply to a workspace file and shows each decision's source line, scope, and reason.
- Pretty, JSON, and Markdown Context Lens output for local review, CI, and pull requests.
- Verified release tarball attached to GitHub Releases for installation when the public npm `rulesync` name resolves to another project.

### Security

- Context Lens never prints rule bodies, calls a network, executes shell commands, or reads outside the workspace boundary.
- Output explicitly states that static scope prediction does not prove provider runtime loading or compliance.

## [1.1.0] - 2026-08-18

### Added

- `rulesync receipt` creates deterministic JSON, Markdown, or standalone HTML context fingerprints.
- Context receipts show canonical/target SHA-256 values, byte and token estimates, a 12-character context ID, and `synced`/`missing`/`drifted` status.
- `rulesync receipt --check` provides a CI-friendly drift gate without modifying source or target files.
- Cross-platform workspace boundary checks now handle POSIX fixtures on Windows and reject sibling-prefix traversal.
- Repository lint configuration and verification artifacts added.

### Fixed

- Removed lint-blocking unnecessary regular-expression escapes in existing secret and unsafe-command detectors.

## [1.0.0] - 2026-08-05

### Initial Release 🎉

- **Abstract Rule Tree (ART) Engine**: Fast Markdown AST parser extracting rule titles, descriptions, globs, tool scopes, and metadata annotations.
- **Multi-Target Compiler Matrix**:
  - Anthropic Claude Code (`CLAUDE.md`)
  - Cursor IDE (`.cursor/rules/*.mdc` with YAML frontmatter)
  - GitHub Copilot (`.github/copilot-instructions.md`)
  - Cline / RooCode (`.cline/instructions.json`)
  - Windsurf (`.windsurfrules`)
  - OpenCode / Standard (`AGENTS.md`)
- **Static Linter Engine**:
  - `no-duplicate-rules`: Identifies redundant or identical directives.
  - `no-contradictory-directives`: Detects conflicting guidelines.
  - `max-token-budget`: Warns on prompt token threshold overruns (>2,000 tokens).
  - `require-glob-scope`: Recommends file globs for tech-specific rules.
  - `no-unsafe-commands`: Catches dangerous shell command directives (`rm -rf /`, `chmod 777`).
  - `no-secret-patterns`: Intercepts hardcoded API keys and secrets.
  - `no-empty-rules`: Flags empty header sections.
- **CLI Commands**:
  - `rulesync init`: Interactive workspace initialization and starter `AGENTS.md`.
  - `rulesync lint`: Static rule analysis with colorized terminal reporting.
  - `rulesync build`: Multi-target cross-compilation with dry-run support.
  - `rulesync check`: CI verification mode for verifying synchronized rule state.
  - `rulesync watch`: Live filesystem watcher auto-compiling on file save.
  - `rulesync diff`: Colorized terminal diff preview between target rule files.
- **Security Protections**:
  - Strict workspace boundary path resolution (`sanitizeWorkspacePath`).
  - 100% offline local execution (zero telemetry, zero remote network calls).
