/**
 * Command: rulesync watch
 */

import * as fs from 'fs';
import pc from 'picocolors';
import { loadConfig } from '../config/index.js';
import { handleBuild } from './build.js';
import { handleLint } from './lint.js';
import { sanitizeWorkspacePath } from '../utils/path.js';

export async function handleWatch(): Promise<void> {
  const cwd = process.cwd();
  const config = loadConfig(cwd);
  const sourcePath = sanitizeWorkspacePath(config.source, cwd);

  if (!fs.existsSync(sourcePath)) {
    console.error(pc.red(`❌ Error: Source rule file "${config.source}" not found. Run "rulesync init" first.`));
    return;
  }

  console.log(pc.bold(pc.cyan(`\n👀 Watching "${config.source}" for changes... (Press Ctrl+C to exit)\n`)));

  // Initial build
  await handleLint({});
  await handleBuild({});

  let debounceTimer: NodeJS.Timeout | null = null;

  fs.watch(sourcePath, (eventType) => {
    if (eventType === 'change') {
      if (debounceTimer) clearTimeout(debounceTimer);

      debounceTimer = setTimeout(async () => {
        console.log(pc.yellow(`\n🔄 File change detected in "${config.source}". Rebuilding...`));
        const lintOk = await handleLint({});
        if (lintOk) {
          await handleBuild({});
        }
      }, 300);
    }
  });
}
