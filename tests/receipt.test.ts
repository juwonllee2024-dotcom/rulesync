import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { handleInit } from '../src/commands/init.js';
import { handleBuild } from '../src/commands/build.js';
import { createContextReceipt, receiptIsSynced } from '../src/receipt/index.js';

describe('Context Receipt', () => {
  const testDir = path.join(process.cwd(), 'tests', 'tmp_receipt_workspace');

  beforeEach(async () => {
    if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
    fs.mkdirSync(testDir, { recursive: true });
    await handleInit({ yes: true, cwd: testDir });
    await handleBuild({ cwd: testDir });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('fingerprints synchronized canonical and target context deterministically', () => {
    const first = createContextReceipt(testDir, '2026-08-18T15:00:00.000Z');
    const second = createContextReceipt(testDir, '2026-08-19T15:00:00.000Z');

    expect(first.schemaVersion).toBe(1);
    expect(first.source.path).toBe('AGENTS.md');
    expect(first.source.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(first.targets).toHaveLength(5);
    expect(first.summary).toEqual({ synced: 5, missing: 0, drifted: 0, total: 5 });
    expect(first.targets.every((target) => target.status === 'synced')).toBe(true);
    expect(first.contextId).toMatch(/^[a-f0-9]{12}$/);
    expect(first.contextId).toBe(second.contextId);
    expect(receiptIsSynced(first)).toBe(true);
  });

  it('distinguishes missing and drifted target files', () => {
    fs.rmSync(path.join(testDir, 'CLAUDE.md'));
    fs.writeFileSync(path.join(testDir, '.windsurfrules'), 'changed on disk\n', 'utf8');

    const receipt = createContextReceipt(testDir, '2026-08-18T15:00:00.000Z');
    const missing = receipt.targets.find((target) => target.target === 'claude');
    const drifted = receipt.targets.find((target) => target.target === 'windsurf');

    expect(missing?.status).toBe('missing');
    expect(missing?.actualSha256).toBeUndefined();
    expect(drifted?.status).toBe('drifted');
    expect(drifted?.actualSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(receipt.summary).toEqual({ synced: 3, missing: 1, drifted: 1, total: 5 });
    expect(receiptIsSynced(receipt)).toBe(false);
  });
});
