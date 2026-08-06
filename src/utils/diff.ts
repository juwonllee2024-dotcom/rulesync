/**
 * Terminal Diff Formatting Utility
 */

import pc from 'picocolors';

export interface DiffLine {
  type: 'add' | 'delete' | 'same';
  content: string;
  lineNumberOld?: number;
  lineNumberNew?: number;
}

export function generateUnifiedDiff(oldText: string, newText: string, filename: string): string {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const output: string[] = [];
  output.push(pc.bold(`--- a/${filename}`));
  output.push(pc.bold(`+++ b/${filename}`));

  let i = 0;
  let j = 0;

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      // Unchanged line
      output.push(`  ${oldLines[i]}`);
      i++;
      j++;
    } else if (j < newLines.length && (i >= oldLines.length || !oldLines.includes(newLines[j]))) {
      // Added line
      output.push(pc.green(`+ ${newLines[j]}`));
      j++;
    } else if (i < oldLines.length) {
      // Removed line
      output.push(pc.red(`- ${oldLines[i]}`));
      i++;
    }
  }

  return output.join('\n');
}
