/**
 * Configuration Loader for RuleSync
 */

import * as fs from 'fs';
import * as path from 'path';
import { RuleSyncConfig } from '../types/index.js';
import { sanitizeWorkspacePath } from '../utils/path.js';

export const DEFAULT_CONFIG: RuleSyncConfig = {
  source: 'AGENTS.md',
  targets: ['claude', 'cursor', 'copilot', 'cline', 'windsurf'],
  maxTokens: 2000,
  headerComment: true,
  ignoreRules: [],
};

export const CONFIG_FILE_NAMES = ['.rulesync.json', 'rulesync.json', '.rulesync/config.json'];

export function loadConfig(workspaceDir: string = process.cwd()): RuleSyncConfig {
  for (const configFile of CONFIG_FILE_NAMES) {
    try {
      const fullPath = path.resolve(workspaceDir, configFile);
      if (fs.existsSync(fullPath)) {
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
        };
      }
    } catch {
      // Fall through to default if file read/parse fails
    }
  }

  return DEFAULT_CONFIG;
}

export function saveConfig(config: RuleSyncConfig, workspaceDir: string = process.cwd()): string {
  const targetDir = sanitizeWorkspacePath('.rulesync', workspaceDir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const configPath = path.join(targetDir, 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  return configPath;
}
