import { AbstractRuleTree, CompiledOutput } from '../../types/index.js';

export function compileCline(art: AbstractRuleTree): CompiledOutput {
  const instructionsList = art.rules.map(r => {
    let text = `[${r.metadata.title}]`;
    if (r.metadata.globs && r.metadata.globs.length > 0) {
      text += ` (Files: ${r.metadata.globs.join(', ')})`;
    }
    text += `\n${r.content}`;
    return text;
  });

  const payload = {
    _generator: 'RuleSync (https://github.com/rulesync/rulesync)',
    title: art.title,
    overview: art.overview || '',
    customInstructions: instructionsList.join('\n\n'),
  };

  return {
    target: 'cline',
    relativePath: '.cline/instructions.json',
    content: JSON.stringify(payload, null, 2) + '\n',
  };
}
