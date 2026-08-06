/**
 * Command: rulesync init
 */

import * as fs from 'fs';
import pc from 'picocolors';
import { saveConfig, DEFAULT_CONFIG } from '../config/index.js';
import { sanitizeWorkspacePath } from '../utils/path.js';

const STARTER_AGENTS_MD = `# Repository AI Rules

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
- Do not execute destructive shell commands (\`rm -rf\`, \`chmod 777\`).
`;

export async function handleInit(options: { force?: boolean; yes?: boolean; cwd?: string }): Promise<void> {
  const cwd = options.cwd || process.cwd();
  console.log(pc.cyan(pc.bold('\n🚀 Initializing RuleSync workspace...\n')));

  const sourcePath = sanitizeWorkspacePath('AGENTS.md', cwd);
  const exists = fs.existsSync(sourcePath);

  if (exists && !options.force) {
    console.log(pc.yellow(`ℹ️  Found existing ${pc.bold('AGENTS.md')}. Keeping existing file.`));
  } else {
    fs.writeFileSync(sourcePath, STARTER_AGENTS_MD, 'utf-8');
    console.log(pc.green(`✓ Created starter canonical ${pc.bold('AGENTS.md')} rule file.`));
  }

  saveConfig(DEFAULT_CONFIG, cwd);
  console.log(pc.green(`✓ Created configuration file at ${pc.bold('.rulesync/config.json')}.`));

  console.log(pc.bold(pc.green('\n✅ RuleSync initialized successfully!')));
}
