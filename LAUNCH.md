# 🚀 RuleSync Launch Strategy & Promotional Copy Assets

This document contains ready-to-publish launch copy, community posts, social media announcements, and technical blog outlines for launching **RuleSync**.

---

## 1. Tagline & Short Descriptions

* **Tagline**: The ESLint & Babel for AI Agent Rules — Compile, lint, optimize, and sync instructions across `AGENTS.md`, `CLAUDE.md`, `.cursor/rules`, and Copilot.
* **One-Sentence Summary**: `RuleSync` is an open-source CLI engine and cross-format compiler that maintains a single canonical source of truth for repository AI agent instructions and synchronizes them across 10+ AI tools while statically linting for prompt bloat, duplicate rules, and security flaws.
* **Keywords / Topics**: `ai-agents`, `claude-code`, `cursor-rules`, `copilot-instructions`, `agents-md`, `linter`, `compiler`, `developer-tools`, `cli`, `typescript`.

---

## 2. Hacker News Submission ("Show HN")

**Title**: Show HN: RuleSync – ESLint and Babel for AI Agent Rules (`CLAUDE.md`, `.cursor/rules`)

**Submission Text**:
```markdown
Hey HN!

I built RuleSync (https://github.com/rulesync/rulesync) because our engineering team ran into "AI instruction drift."

When working across multiple AI tools (Claude Code CLI, Cursor IDE, GitHub Copilot, Cline, Windsurf), every tool mandates its own rule file format (`CLAUDE.md`, `.cursor/rules/*.mdc`, `.github/copilot-instructions.md`, `.cline/instructions.json`). Updating rules in one place meant manually editing 4 other markdown and JSON files across every repository.

Worse, over time, rule files accumulated duplicate directives, conflicting guidelines (e.g. "prefer type aliases" in Cursor vs "prefer interfaces" in Copilot), and token bloat that degraded LLM context window quality.

RuleSync solves this by acting as the "ESLint and Babel for AI Agent Rules":

1. Canonical Source of Truth: Write rules once in `AGENTS.md` (or `.rulesync/rules/`).
2. Static AST Linter Engine: Detects duplicate rules, contradictory directives, token budget overruns (>2,000 tokens), missing glob scopes, and unescaped shell security bugs (`rm -rf /`, hardcoded secrets).
3. Multi-Target Compiler Matrix: Compiles optimized native formats for Claude Code, Cursor, Copilot, Cline, Windsurf, and OpenCode with a single command (`npx rulesync build`).
4. CI & Pre-commit Check: Run `rulesync check` in GitHub Actions or pre-commit hooks to ensure team members never push out-of-sync AI instructions.

It’s 100% open-source (MIT), zero dependencies on paid LLM APIs, and executes in under 5 milliseconds.

Try it in 10 seconds:
$ npx rulesync init
$ npx rulesync lint
$ npx rulesync build

GitHub: https://github.com/rulesync/rulesync

Would love your feedback on additional target adapters or linter rules you'd like to see!
```

---

## 3. Product Hunt Copy

* **Tagline**: The ESLint & Babel for AI Agent Rules
* **Description**:
  Maintain a single canonical source of truth for your repository's AI agent rules (`AGENTS.md`) and automatically compile, lint, optimize, and sync instructions across Claude Code, Cursor, Copilot, Cline, and Windsurf. Free and open-source!

* **First Maker Comment**:
  > "Hi Product Hunt! 👋
  >
  > We created RuleSync to solve AI instruction drift. As developers use multiple AI tools simultaneously, keeping project context and rule guidelines updated across `.cursor/rules`, `CLAUDE.md`, and `.github/copilot-instructions.md` quickly becomes a nightmare.
  >
  > RuleSync parses your markdown instructions into an Abstract Rule Tree (ART), runs static linter checks (catching duplicates, rule conflicts, token bloat, and secret leaks), and compiles native target files in milliseconds.
  >
  > We'd love for you to give it a spin with `npx rulesync init` and let us know what targets you want us to add next!"

---

## 4. Reddit Community Posts

### Post for `r/programming` and `r/LocalLLaMA`
**Title**: Stop prompt drift across Cursor, Claude Code, and Copilot: I built an open-source cross-compiler and linter for AI agent rules

**Body**:
> "If you use multiple AI coding assistants, you've probably noticed that every tool insists on its own instruction rule format:
> - Cursor uses `.cursor/rules/*.mdc` with frontmatter globs.
> - Claude Code uses `CLAUDE.md`.
> - GitHub Copilot uses `.github/copilot-instructions.md`.
> - Cline / RooCode uses `.cline/instructions.json`.
> - Windsurf uses `.windsurfrules`.
>
> Manually syncing rules across all these tools is tedious, and un-linted rules lead to prompt bloat and conflicting guidance that degrades LLM response accuracy.
>
> I built **RuleSync** (`npx rulesync`), a zero-dependency local CLI that compiles, lints, and synchronizes AI rules across all tools from a single `AGENTS.md` file.
>
> Check out the GitHub repo: https://github.com/rulesync/rulesync
> Feedback and PRs welcome!"

---

## 5. Technical Blog Post Outline (Dev.to / Hashnode)

**Title**: How to Prevent Prompt Drift & Token Bloat Across AI Coding Assistants

1. **The Multi-Agent Workflow Problem**:
   - Why modern developers use 2–4 AI assistants concurrently.
   - The hidden cost of duplicated and conflicting AI instruction files.
2. **Introducing Abstract Rule Trees (ART)**:
   - How parsing Markdown instructions into ASTs enables static rule analysis.
3. **5 Common AI Rule Anti-Patterns Catches by Linter**:
   - Duplicate directives across files.
   - Contradictory type / style guidelines.
   - Token budget overruns (>2,000 tokens inflating prompt costs).
   - Tech-specific rules lacking glob scope limits.
   - Hardcoded API keys or unsafe shell commands.
4. **Step-by-Step Guide to Setting Up RuleSync**:
   - Running `npx rulesync init`, `rulesync lint`, and `rulesync build`.
   - Automating checks in GitHub Actions (`rulesync check`).

---

## 6. X / Twitter Announcement Thread

**Tweet 1**:
🚀 Tired of manually updating `CLAUDE.md`, `.cursor/rules`, and Copilot instructions across your repos?

Meet **RuleSync**: The ESLint & Babel for AI Agent Rules!

Write rules once in `AGENTS.md` ➔ Lint for conflicts ➔ Compile across 10+ AI tools in 3ms.

100% Open-Source (MIT) 👇
https://github.com/rulesync/rulesync

**Tweet 2**:
🔍 RuleSync parses your AI instructions into an Abstract Rule Tree (ART) and runs static linter rules:
• Catches duplicate directives
• Detects rule contradictions
• Warns on token budget overruns (>2k tokens)
• Blocks hardcoded API secrets & destructive commands (`rm -rf`)

**Tweet 3**:
⚡ Try it right now in your terminal:
`npx rulesync init`
`npx rulesync lint`
`npx rulesync build`

Supports Cursor, Claude Code, Copilot, Cline, Windsurf, and OpenCode!

Give it a ⭐ on GitHub if you find it useful!
https://github.com/rulesync/rulesync

---

## 7. Milestone Growth Action Plan

| Milestone | Key Action Items |
|---|---|
| **First 10 Users** | Direct outreach to open-source maintainers on GitHub; embed `RuleSync` in popular template repos. |
| **100 Stars** | Show HN launch, Product Hunt release, Reddit posts in `r/programming` and `r/ClaudeAI`. |
| **1,000 Stars** | Release GitHub Action (`rulesync/action`), add support for AWS Q & Zed, publish technical deep-dive on Dev.to. |
| **5,000 Stars** | Create VS Code extension wrapper, host Community Target Adapter hackathon, launch good-first-issue program. |
| **10,000 Stars** | Establish RuleSync Ecosystem Working Group, standardize `AGENTS.md` spec across open-source maintainer tools. |
