/**
 * Command: rulesync lint
 */

import * as fs from 'fs';
import pc from 'picocolors';
import { loadConfig } from '../config/index.js';
import { parseMarkdownToART } from '../parser/art.js';
import { runLinter } from '../linter/engine.js';
import { sanitizeWorkspacePath } from '../utils/path.js';

export async function handleLint(options: { format?: 'pretty' | 'json'; maxTokens?: number; cwd?: string }): Promise<boolean> {
  const cwd = options.cwd || process.cwd();
  const config = loadConfig(cwd);

  if (options.maxTokens) {
    config.maxTokens = options.maxTokens;
  }

  const sourcePath = sanitizeWorkspacePath(config.source, cwd);

  if (!fs.existsSync(sourcePath)) {
    console.error(pc.red(`❌ Error: Source rule file "${config.source}" not found. Run "rulesync init" first.`));
    return false;
  }

  const markdown = fs.readFileSync(sourcePath, 'utf-8');
  const art = parseMarkdownToART(markdown, config.source);
  const result = runLinter(art, config);

  if (options.format === 'json') {
    console.log(JSON.stringify(result, null, 2));
    return result.errorCount === 0;
  }

  console.log(pc.bold(pc.cyan(`\n🔍 Linting AI Agent Rules in "${config.source}"...\n`)));

  if (result.issues.length === 0) {
    console.log(pc.green(`✨ Clean! No linter issues found (~${result.tokenCount} tokens).\n`));
    return true;
  }

  for (const issue of result.issues) {
    const prefix = issue.severity === 'error' ? pc.red('  ✖ error') : pc.yellow('  ⚠ warning');
    const location = issue.line ? pc.gray(`:${issue.line}`) : '';
    console.log(`${prefix} ${pc.bold(issue.code)} ${pc.gray(`(${config.source}${location})`)}`);
    console.log(`    ${issue.message}`);
    if (issue.suggestion) {
      console.log(pc.gray(`    💡 Suggestion: ${issue.suggestion}`));
    }
    console.log();
  }

  const summary = `${result.errorCount} error(s), ${result.warningCount} warning(s) (~${result.tokenCount} tokens)`;
  if (result.errorCount > 0) {
    console.log(pc.bold(pc.red(`✖ Failed with ${summary}\n`)));
    return false;
  } else {
    console.log(pc.bold(pc.yellow(`⚠ Passed with warnings: ${summary}\n`)));
    return true;
  }
}
