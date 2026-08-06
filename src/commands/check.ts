/**
 * Command: rulesync check (CI / Pre-commit verification)
 */

import * as fs from 'fs';
import pc from 'picocolors';
import { loadConfig } from '../config/index.js';
import { parseMarkdownToART } from '../parser/art.js';
import { compileToTargets } from '../compiler/matrix.js';
import { sanitizeWorkspacePath } from '../utils/path.js';

export async function handleCheck(options: { quiet?: boolean; cwd?: string }): Promise<boolean> {
  const cwd = options.cwd || process.cwd();
  const config = loadConfig(cwd);

  const sourcePath = sanitizeWorkspacePath(config.source, cwd);

  if (!fs.existsSync(sourcePath)) {
    if (!options.quiet) {
      console.error(pc.red(`❌ Error: Source rule file "${config.source}" not found.`));
    }
    return false;
  }

  const markdown = fs.readFileSync(sourcePath, 'utf-8');
  const art = parseMarkdownToART(markdown, config.source);
  const compiledOutputs = compileToTargets(art, config.targets, config);

  let outOfSyncCount = 0;

  for (const output of compiledOutputs) {
    const targetFilePath = sanitizeWorkspacePath(output.relativePath, cwd);

    if (!fs.existsSync(targetFilePath)) {
      if (!options.quiet) {
        console.log(pc.red(`  ✖ Missing target file: ${output.relativePath}`));
      }
      outOfSyncCount++;
      continue;
    }

    const existingContent = fs.readFileSync(targetFilePath, 'utf-8');

    if (existingContent.trim() !== output.content.trim()) {
      if (!options.quiet) {
        console.log(pc.red(`  ✖ Target file out of sync: ${output.relativePath}`));
      }
      outOfSyncCount++;
    } else if (!options.quiet) {
      console.log(pc.green(`  ✓ Up to date: ${output.relativePath}`));
    }
  }

  if (outOfSyncCount > 0) {
    if (!options.quiet) {
      console.log(pc.bold(pc.red(`\n❌ Check failed: ${outOfSyncCount} target file(s) are missing or out of sync.`)));
      console.log(pc.gray(`Run `) + pc.cyan('npx rulesync build') + pc.gray(` to synchronize target rule files.\n`));
    }
    return false;
  }

  if (!options.quiet) {
    console.log(pc.bold(pc.green('\n✅ Check passed: All target rule files are up to date with source!\n')));
  }

  return true;
}
