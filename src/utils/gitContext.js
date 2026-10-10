const path = require('path');
const fse = require('fs-extra');
const { runCapture } = require('./proc');

/**
 * Checks whether the given directory is inside an active Git worktree.
 */
function isInsideGitRepo(dir) {
  try {
    const target = fse.existsSync(dir) ? dir : path.dirname(dir);
    const res = runCapture('git rev-parse --is-inside-work-tree', { cwd: target }).trim();
    return res === 'true';
  } catch {
    return false;
  }
}

/**
 * Detects if the targetPath is nested inside an existing parent Git repository.
 * Returns the parent repo top-level path if nested, or null if targetPath is standalone or outside Git.
 */
function getParentGitRepo(targetPath) {
  try {
    const absTarget = path.resolve(targetPath);
    const parentDir = path.dirname(absTarget);
    if (!fse.existsSync(parentDir)) return null;

    const toplevel = runCapture('git rev-parse --show-toplevel', { cwd: parentDir }).trim();
    if (toplevel && path.resolve(toplevel) !== absTarget) {
      return toplevel;
    }
  } catch {}
  return null;
}

/**
 * Asks a user for Y/N confirmation via available context (interactive repl, readline, or env flag).
 */
async function promptConfirmation(context, question, defaultChoice = 'n') {
  if (process.env.RAPIDFIRE_AUTO_GIT === '1') return true;
  if (process.env.RAPIDFIRE_AUTO_GIT === '0') return false;

  let answer = defaultChoice;

  if (context && typeof context.ask === 'function') {
    answer = await context.ask(question);
  } else if (context && context.rl) {
    answer = await new Promise((resolve) => {
      context.rl.question(question, (ans) => resolve(ans));
    });
  } else {
    // Non-interactive / headless environment default
    return defaultChoice.toLowerCase().startsWith('y');
  }

  return Boolean(answer && answer.trim().toLowerCase().startsWith('y'));
}

module.exports = {
  isInsideGitRepo,
  getParentGitRepo,
  promptConfirmation
};
