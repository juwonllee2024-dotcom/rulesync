/**
 * Security & Path Utilities for RuleSync
 * Enforces strict workspace boundary constraints to prevent path traversal attacks.
 */

import * as path from 'path';

function pathApiFor(rootDir: string): typeof path.posix {
  return rootDir.startsWith('/') ? path.posix : path;
}

/**
 * Asserts that targetPath resides inside rootDir (workspace).
 * Throws a SecurityError if the resolved path escapes the workspace boundary.
 */
export function sanitizeWorkspacePath(targetPath: string, rootDir: string = process.cwd()): string {
  const pathApi = pathApiFor(rootDir);
  const resolvedRoot = pathApi.resolve(rootDir);
  const resolvedTarget = pathApi.resolve(resolvedRoot, targetPath);
  const rootPrefix = resolvedRoot.endsWith(pathApi.sep) ? resolvedRoot : `${resolvedRoot}${pathApi.sep}`;

  if (resolvedTarget !== resolvedRoot && !resolvedTarget.startsWith(rootPrefix)) {
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
  const pathApi = pathApiFor(rootDir);
  const relative = pathApi.relative(pathApi.resolve(rootDir), pathApi.resolve(filePath));
  return relative.replace(/\\/g, '/');
}
