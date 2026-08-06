/**
 * Security & Path Utilities for RuleSync
 * Enforces strict workspace boundary constraints to prevent path traversal attacks.
 */

import * as path from 'path';

/**
 * Asserts that targetPath resides inside rootDir (workspace).
 * Throws a SecurityError if the resolved path escapes the workspace boundary.
 */
export function sanitizeWorkspacePath(targetPath: string, rootDir: string = process.cwd()): string {
  const resolvedRoot = path.resolve(rootDir);
  const resolvedTarget = path.resolve(resolvedRoot, targetPath);

  if (!resolvedTarget.startsWith(resolvedRoot)) {
    throw new Error(
      `Security Exception: Path traversal attempt blocked. Target path "${targetPath}" resolves outside workspace directory "${resolvedRoot}".`
    );
  }

  return resolvedTarget;
}

/**
 * Normalizes relative path for cross-platform consistency (Unix forward slashes).
 */
export function normalizeRelativePath(filePath: string, rootDir: string = process.cwd()): string {
  const relative = path.relative(rootDir, filePath);
  return relative.replace(/\\/g, '/');
}
