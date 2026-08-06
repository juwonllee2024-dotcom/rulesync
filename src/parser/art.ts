/**
 * Abstract Rule Tree (ART) Parser
 * Converts Markdown instruction specs into a structured, queryable AST.
 */

import { AbstractRuleTree, RuleNode, RuleMetadata } from '../types/index.js';

export function parseMarkdownToART(markdown: string, filePath?: string): AbstractRuleTree {
  const lines = markdown.split('\n');
  let title = 'Repository AI Rules';
  let overview = '';
  const globalGlobs: string[] = [];
  const rules: RuleNode[] = [];

  let currentRule: Partial<RuleNode> | null = null;
  let currentContent: string[] = [];
  let inOverview = false;
  const overviewLines: string[] = [];

  // Parse YAML frontmatter if present
  let startLine = 0;
  if (lines[0]?.trim() === '---') {
    let fmEnd = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        fmEnd = i;
        break;
      }
    }
    if (fmEnd !== -1) {
      const fmContent = lines.slice(1, fmEnd).join('\n');
      const globsMatch = fmContent.match(/globs:\s*\[(.*?)\]/);
      if (globsMatch) {
        globsMatch[1].split(',').forEach(g => {
          const cleaned = g.trim().replace(/^['"]|['"]$/g, '');
          if (cleaned) globalGlobs.push(cleaned);
        });
      }
      startLine = fmEnd + 1;
    }
  }

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      title = line.substring(2).trim();
      inOverview = true;
      continue;
    }

    if (line.startsWith('## ') || line.startsWith('### ')) {
      inOverview = false;

      // Save previous rule
      if (currentRule && currentRule.metadata) {
        currentRule.content = currentContent.join('\n').trim();
        rules.push(currentRule as RuleNode);
      }

      const sectionTitle = line.replace(/^#+\s*/, '').trim();
      const ruleId = sectionTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      let globs: string[] | undefined;
      let tools: string[] | undefined;
      let category: RuleMetadata['category'] = 'workflow';
      let alwaysApply: boolean | undefined;

      // Lookahead up to 3 lines for HTML comment annotations
      for (let lookahead = 1; lookahead <= 3 && i + lookahead < lines.length; lookahead++) {
        const nextLine = lines[i + lookahead].trim();
        if (nextLine.startsWith('<!--') && nextLine.includes('-->')) {
          // Remove comment markers
          const inner = nextLine.replace(/^<!--\s*/, '').replace(/\s*-->$/, '');
          
          if (inner.startsWith('globs:')) {
            const rawGlobs = inner.substring('globs:'.length).trim();
            globs = rawGlobs.split(',').map(g => g.trim()).filter(Boolean);
          }
          if (inner.startsWith('tools:')) {
            const rawTools = inner.substring('tools:'.length).trim();
            tools = rawTools.split(',').map(t => t.trim()).filter(Boolean);
          }
          if (inner.startsWith('category:')) {
            category = inner.substring('category:'.length).trim() as any;
          }
          if (inner.includes('alwaysApply: true')) {
            alwaysApply = true;
          }
        }
      }

      currentRule = {
        metadata: {
          id: ruleId,
          title: sectionTitle,
          globs,
          tools,
          category,
          alwaysApply,
        },
        rawSource: line,
        line: i + 1,
      };
      currentContent = [];
      continue;
    }

    if (inOverview) {
      overviewLines.push(line);
    } else if (currentRule) {
      currentContent.push(line);
    }
  }

  // Push last rule
  if (currentRule && currentRule.metadata) {
    currentRule.content = currentContent.join('\n').trim();
    rules.push(currentRule as RuleNode);
  }

  overview = overviewLines.join('\n').trim();

  return {
    title,
    overview,
    globalGlobs: globalGlobs.length > 0 ? globalGlobs : undefined,
    rules,
    rawMarkdown: markdown,
    filePath,
  };
}
