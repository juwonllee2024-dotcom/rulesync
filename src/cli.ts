#!/usr/bin/env node

/**
 * RuleSync CLI Main Entrypoint
 */

import { Command } from 'commander';
import pc from 'picocolors';
import { handleInit } from './commands/init.js';
import { handleLint } from './commands/lint.js';
import { handleBuild } from './commands/build.js';
import { handleCheck } from './commands/check.js';
import { handleWatch } from './commands/watch.js';
import { handleDiff } from './commands/diff.js';
import { handleReceipt } from './receipt/index.js';
import { handleExplain } from './explain/index.js';

const program = new Command();

program
  .name('rulesync')
  .description('The ESLint & Babel for AI Agent Rules — Compile, lint, optimize, and sync instructions across AGENTS.md, CLAUDE.md, .cursor/rules, and Copilot.')
  .version('1.2.0');

program
  .command('init')
  .description('Bootstrap RuleSync workspace and canonical AGENTS.md rule file')
  .option('-f, --force', 'Overwrite existing AGENTS.md file')
  .option('-y, --yes', 'Skip prompts and accept defaults')
  .action(async (options) => {
    try {
      await handleInit(options);
    } catch (err: any) {
      console.error(pc.red(`❌ Init failed: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('lint')
  .description('Lint source rule files against static analysis rules')
  .option('--format <format>', 'Output format (pretty | json)', 'pretty')
  .option('--max-tokens <number>', 'Override maximum token threshold', parseInt)
  .action(async (options) => {
    try {
      const success = await handleLint(options);
      if (!success) process.exit(1);
    } catch (err: any) {
      console.error(pc.red(`❌ Lint failed: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('build')
  .description('Compile source rule files into target AI agent instruction formats')
  .option('-t, --targets <targets>', 'Comma-separated target list (e.g. claude,cursor,copilot,cline,windsurf,agents)')
  .option('--dry-run', 'Simulate build output without writing files')
  .action(async (options) => {
    try {
      const success = await handleBuild(options);
      if (!success) process.exit(1);
    } catch (err: any) {
      console.error(pc.red(`❌ Build failed: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('check')
  .description('Verify that compiled target rule files match source rules (for CI / Git hooks)')
  .option('-q, --quiet', 'Suppress stdout output')
  .action(async (options) => {
    try {
      const success = await handleCheck(options);
      if (!success) process.exit(1);
    } catch (err: any) {
      console.error(pc.red(`❌ Check failed: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('watch')
  .description('Watch source rule file and automatically compile on changes')
  .action(async () => {
    try {
      await handleWatch();
    } catch (err: any) {
      console.error(pc.red(`❌ Watch failed: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('diff')
  .description('Preview unified diffs between current target files and compiled output')
  .option('-t, --target <target>', 'Target to diff (claude | cursor | copilot | cline | windsurf | agents)')
  .action(async (options) => {
    try {
      await handleDiff(options);
    } catch (err: any) {
      console.error(pc.red(`❌ Diff failed: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('receipt')
  .description('Fingerprint exactly what each configured agent target should receive')
  .option('--format <format>', 'Output format (json | markdown | html)', 'markdown')
  .option('-o, --output <path>', 'Write receipt to an explicit workspace-relative path')
  .option('--check', 'Exit with code 1 when a target is missing or drifted')
  .action(async (options) => {
    try {
      const success = await handleReceipt(options);
      if (!success) process.exit(1);
    } catch (err: any) {
      console.error(pc.red(`??Receipt failed: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('explain <path>')
  .description('Explain which canonical rules apply to one workspace file')
  .option('-t, --target <target>', 'Target to explain (claude | cursor | copilot | cline | windsurf | agents)')
  .option('--format <format>', 'Output format (pretty | json | markdown)', 'pretty')
  .option('-o, --output <path>', 'Write the explanation to an explicit workspace-relative path')
  .action(async (inputPath, options) => {
    try {
      const success = handleExplain(inputPath, options);
      if (!success) process.exit(1);
    } catch (err: any) {
      console.error(pc.red(`??Explain failed: ${err.message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);
