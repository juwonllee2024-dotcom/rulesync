/**
 * Compiler Matrix Orchestrator
 */

import { AbstractRuleTree, CompiledOutput, TargetAdapterName, RuleSyncConfig } from '../types/index.js';
import { compileClaude } from './adapters/claude.js';
import { compileCursor } from './adapters/cursor.js';
import { compileCopilot } from './adapters/copilot.js';
import { compileCline } from './adapters/cline.js';
import { compileWindsurf } from './adapters/windsurf.js';
import { compileAgents } from './adapters/agents.js';

export function compileToTargets(
  art: AbstractRuleTree,
  targets: TargetAdapterName[],
  config?: RuleSyncConfig
): CompiledOutput[] {
  const outputs: CompiledOutput[] = [];
  const addHeader = config?.headerComment !== false;

  for (const target of targets) {
    switch (target) {
      case 'claude':
        outputs.push(compileClaude(art, addHeader));
        break;
      case 'cursor':
        outputs.push(compileCursor(art, addHeader));
        break;
      case 'copilot':
        outputs.push(compileCopilot(art, addHeader));
        break;
      case 'cline':
        outputs.push(compileCline(art));
        break;
      case 'windsurf':
        outputs.push(compileWindsurf(art, addHeader));
        break;
      case 'agents':
        outputs.push(compileAgents(art, addHeader));
        break;
    }
  }

  return outputs;
}
