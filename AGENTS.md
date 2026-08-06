# Repository AI Rules

Canonical repository instructions for AI coding assistants (Claude Code, Cursor, Copilot, Cline, Windsurf).

## Code Style & Standards
<!-- globs: **/*.ts, **/*.tsx -->
- Always use TypeScript strict mode with explicit return types.
- Prefer named exports over default exports.
- Use immutable state updates and modern ES2022+ syntax.

## Testing & Quality
<!-- globs: tests/**/*.ts, **/*.spec.ts -->
- Write unit tests for all business logic using Vitest or Jest.
- Maintain high test coverage and test edge cases and error paths explicitly.

## Security & Privacy Guidelines
- Never hardcode API keys, access tokens, or secrets in source code.
- Always validate external input and check path resolution bounds.
- Do not execute destructive shell commands (`rm -rf`, `chmod 777`).
