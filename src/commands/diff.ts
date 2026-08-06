/**
 * Command: rulesync diff
 */

import * as fs from 'fs';
import pc from 'picocolors';
import { loadConfig } from '../config/index.js';
import { parseMarkdownToART } from '../parser/art.js';
import { compileToTargets } from '../compiler/matrix.js';
import { generateUnifiedDiff } from '../utils/diff.js';
import { sanitizeWorkspacePath } from '../utils/path.js';
import { TargetAdapterName } from '../types/index.js';

export async function handleDiff(options: { target?: string }): Promise<void> {
  const cwd = process.cwd();
  const config = loadConfig(cwd);

  let targetsToDiff = config.targets;
  if (options.target) {
    targetsToDiff = [options.target as TargetAdapterName];
  }

  const sourcePath = sanitizeWorkspacePath(config.source, cwd);

  if (!fs.existsSync(sourcePath)) {
    console.error(pc.red(`❌ Error: Source rule file "${config.source}" not found.`));
    return;
  }

  const markdown = fs.readFileSync(sourcePath, 'utf-8');
  const art = parseMarkdownToART(markdown, config.source);
  const compiledOutputs = compileToTargets(art, targetsToDiff, config);

  console.log(pc.bold(pc.cyan(`\n🔍 Diffing target files against "${config.source}"...\n`)));

  for (const output of compiledOutputs) {
    const targetFilePath = sanitizeWorkspacePath(output.relativePath, cwd);
    const existingContent = fs.existsSync(targetFilePath)
      ? fs.readFileSync(targetFilePath, 'utf-8')
      : '';

    if (existingContent.trim() === output.content.trim()) {
      console.log(pc.gray(`[No changes] ${output.relativePath}`));
    } else {
      console.log(pc.bold(pc.yellow(`\n--- Changes for ${output.relativePath} ---`)));
      const diffStr = generateUnifiedDiff(existingContent, output.content, output.relativePath);
      console.log(diffStr);
    }
  }

  console.log();
}
