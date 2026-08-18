/**
 * Context Receipt: fingerprint exactly what each configured agent target should receive.
 */

import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { compileToTargets } from '../compiler/matrix.js';
import { loadConfig } from '../config/index.js';
import { runLinter } from '../linter/engine.js';
import { parseMarkdownToART } from '../parser/art.js';
import { ContextReceipt, ReceiptFormat, ReceiptTarget } from '../types/index.js';
import { sanitizeWorkspacePath } from '../utils/path.js';
import { renderReceiptHtml, renderReceiptJson, renderReceiptMarkdown } from './render.js';

function sha256(value: Buffer | string): string {
  return createHash('sha256').update(value).digest('hex');
}

function tokenEstimate(value: string): number {
  const nonWhitespace = value.replace(/\s/g, '').length;
  return Math.ceil(nonWhitespace / 4);
}

function readBytes(filePath: string): Buffer | undefined {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath) : undefined;
}

function targetStatus(expected: Buffer, actual: Buffer | undefined): ReceiptTarget['status'] {
  if (!actual) return 'missing';
  return actual.equals(expected) ? 'synced' : 'drifted';
}

export function createContextReceipt(cwd: string = process.cwd(), generatedAt: string = new Date().toISOString()): ContextReceipt {
  const config = loadConfig(cwd);
  const sourcePath = sanitizeWorkspacePath(config.source, cwd);
  const sourceBytes = readBytes(sourcePath);
  if (!sourceBytes) throw new Error(`Source rule file "${config.source}" not found. Run "rulesync init" first.`);

  const sourceText = sourceBytes.toString('utf8');
  const art = parseMarkdownToART(sourceText, config.source);
  const lintResult = runLinter(art, config);
  if (lintResult.errorCount > 0) {
    throw new Error(`Cannot create receipt due to ${lintResult.errorCount} blocking linter error(s). Run "rulesync lint" for details.`);
  }

  const compiledOutputs = compileToTargets(art, config.targets, config);
  const targets: ReceiptTarget[] = compiledOutputs.map((output) => {
    const expectedBytes = Buffer.from(output.content, 'utf8');
    const targetPath = sanitizeWorkspacePath(output.relativePath, cwd);
    const actualBytes = readBytes(targetPath);
    return {
      target: output.target,
      path: output.relativePath,
      status: targetStatus(expectedBytes, actualBytes),
      expectedSha256: sha256(expectedBytes),
      ...(actualBytes ? { actualSha256: sha256(actualBytes) } : {}),
      bytes: expectedBytes.byteLength,
      tokenEstimate: tokenEstimate(output.content)
    };
  });

  const fingerprint = {
    sourceSha256: sha256(sourceBytes),
    targets: targets.map(({ target, path: targetPath, expectedSha256 }) => ({ target, path: targetPath, expectedSha256 }))
  };
  const summary = {
    synced: targets.filter((target) => target.status === 'synced').length,
    missing: targets.filter((target) => target.status === 'missing').length,
    drifted: targets.filter((target) => target.status === 'drifted').length,
    total: targets.length
  };

  return {
    schemaVersion: 1,
    generatedAt,
    source: {
      path: config.source,
      sha256: sha256(sourceBytes),
      bytes: sourceBytes.byteLength,
      tokenEstimate: tokenEstimate(sourceText)
    },
    contextId: sha256(JSON.stringify(fingerprint)).slice(0, 12),
    targets,
    summary
  };
}

export function receiptIsSynced(receipt: ContextReceipt): boolean {
  return receipt.summary.missing === 0 && receipt.summary.drifted === 0;
}

export interface ReceiptOptions {
  format?: ReceiptFormat;
  output?: string;
  check?: boolean;
  cwd?: string;
}

export async function handleReceipt(options: ReceiptOptions = {}): Promise<boolean> {
  const cwd = options.cwd || process.cwd();
  const receipt = createContextReceipt(cwd);
  const format = options.format || 'markdown';
  const content = format === 'json'
    ? renderReceiptJson(receipt)
    : format === 'html'
      ? renderReceiptHtml(receipt)
      : format === 'markdown'
        ? renderReceiptMarkdown(receipt)
        : (() => { throw new Error(`Unsupported receipt format: ${format}`); })();

  if (options.output) {
    const outputPath = sanitizeWorkspacePath(options.output, cwd);
    const parentDir = path.dirname(outputPath);
    if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`Wrote ${format} context receipt: ${outputPath}`);
  } else {
    console.log(content);
  }

  if (options.check && !receiptIsSynced(receipt)) {
    console.error(`Context receipt check failed: ${receipt.summary.missing} missing, ${receipt.summary.drifted} drifted target(s).`);
    return false;
  }
  return true;
}

export { renderReceiptHtml, renderReceiptJson, renderReceiptMarkdown } from './render.js';
