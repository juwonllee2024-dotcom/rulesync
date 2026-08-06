import { describe, it, expect } from 'vitest';
import { parseMarkdownToART } from '../src/parser/art.js';

describe('ART Parser', () => {
  it('parses standard Markdown with headers into Abstract Rule Tree', () => {
    const md = `# Project AI Rules\n\nGeneral overview statement.\n\n## Rule 1\nRule 1 body.\n\n## Rule 2\nRule 2 body.`;
    const art = parseMarkdownToART(md);

    expect(art.title).toBe('Project AI Rules');
    expect(art.overview).toBe('General overview statement.');
    expect(art.rules).toHaveLength(2);
    expect(art.rules[0].metadata.title).toBe('Rule 1');
    expect(art.rules[0].content).toBe('Rule 1 body.');
  });

  it('extracts HTML comment metadata annotations (globs, tools, category)', () => {
    const md = `# Title\n\n## TypeScript Guidelines\n<!-- globs: src/**/*.ts, src/**/*.tsx -->\n<!-- tools: tsc, eslint -->\nUse strict types.`;
    const art = parseMarkdownToART(md);

    expect(art.rules).toHaveLength(1);
    expect(art.rules[0].metadata.globs).toEqual(['src/**/*.ts', 'src/**/*.tsx']);
    expect(art.rules[0].metadata.tools).toEqual(['tsc', 'eslint']);
  });

  it('parses YAML frontmatter global globs', () => {
    const md = `---\nglobs: ["*.ts", "*.js"]\n---\n\n# Title\n\n## Rule 1\nBody`;
    const art = parseMarkdownToART(md);

    expect(art.globalGlobs).toEqual(['*.ts', '*.js']);
    expect(art.rules).toHaveLength(1);
  });
});
