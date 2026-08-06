/**
 * Command: rulesync build
 */

import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import { loadConfig } from '../config/index.js';
import { parseMarkdownToART } from '../parser/art.js';
import { runLinter } from '../linter/engine.js';
import { compileToTargets } from '../compiler/matrix.js';
import { sanitizeWorkspacePath } from '../utils/path.js';
import { TargetAdapterName } from '../types/index.js';

export async function handleBuild(options: { targets?: string; dryRun?: boolean; cwd?: string }): Promise<boolean> {
  const cwd = options.cwd || process.cwd();
  const config = loadConfig(cwd);

  if (options.targets) {
    config.targets = options.targets.split(',').map(t => t.trim()) as TargetAdapterName[];
  }

  const sourcePath = sanitizeWorkspacePath(config.source, cwd);

  if (!fs.existsSync(sourcePath)) {
    console.error(pc.red(`❌ Error: Source rule file "${config.source}" not found. Run "rulesync init" first.`));
    return false;
  }

  const markdown = fs.readFileSync(sourcePath, 'utf-8');
  const art = parseMarkdownToART(markdown, config.source);
  const lintResult = runLinter(art, config);

  if (lintResult.errorCount > 0) {
    console.error(pc.red(`❌ Cannot build due to ${lintResult.errorCount} blocking linter error(s). Run "rulesync lint" for details.`));
    return false;
  }

  const compiledOutputs = compileToTargets(art, config.targets, config);

  console.log(pc.bold(pc.cyan(`\n🔨 Compiling rules from "${config.source}" to ${compiledOutputs.length} target(s)...\n`)));

  for (const output of compiledOutputs) {
    const targetFilePath = sanitizeWorkspacePath(output.relativePath, cwd);
    const parentDir = path.dirname(targetFilePath);

    if (options.dryRun) {
      console.log(pc.gray(`  [dry-run] Would write `) + pc.cyan(output.relativePath) + pc.gray(` (${output.content.length} chars)`));
    } else {
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(targetFilePath, output.content, 'utf-8');
      console.log(pc.green(`  ✓ Compiled `) + pc.bold(output.target.padEnd(10)) + pc.gray(` -> `) + pc.cyan(output.relativePath));
    }
  }

  console.log(pc.bold(pc.green(`\n✅ Build complete! All target rules are synchronized.\n`)));
  return true;
}
