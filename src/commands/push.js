const path = require('path');
const { run, runCapture } = require('../utils/proc');
const { isGhInstalled, isGhAuthenticated, createRepo } = require('../integrations/gh');

/**
 * Splits command line or args array preserving double and single quotes
 */
function parseTokensWithQuotes(input) {
  const raw = Array.isArray(input) ? input.join(' ') : (input || '');
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  const tokens = [];
  let match;
  while ((match = regex.exec(raw)) !== null) {
    tokens.push(match[1] !== undefined ? match[1] : (match[2] !== undefined ? match[2] : match[0]));
  }
  return tokens;
}

/**
 * Parses unified push arguments from various forms:
 *   - git add . push -branch main -commit "message"
 *   - add <files> push -m -commit "message"
 *   - push -m "message"
 *   - push -b <branch> -m "message"
 *   - push <files> -commit "message"
 */
function parsePushArgs(input) {
  const tokens = parseTokensWithQuotes(input);
  let files = [];
  let branch = null;
  let message = null;

  // Find index of 'push' keyword if present
  let pushIdx = tokens.findIndex((t) => t.toLowerCase() === 'push');
  if (pushIdx === -1) {
    pushIdx = 0;
  }

  // Pre-push tokens: e.g. "git add ." or "add file1.js file2.js"
  const prePush = tokens.slice(0, pushIdx);
  if (prePush.length > 0) {
    let fileCandidates = [];
    if (prePush[0].toLowerCase() === 'git' && prePush[1]?.toLowerCase() === 'add') {
      fileCandidates = prePush.slice(2);
    } else if (prePush[0].toLowerCase() === 'add') {
      fileCandidates = prePush.slice(1);
    }
    if (fileCandidates.length > 0) {
      files.push(...fileCandidates);
    }
  }

  // Post-push tokens
  const postPush = tokens.slice(pushIdx + 1);
  let i = 0;
  while (i < postPush.length) {
    const token = postPush[i];
    const lower = token.toLowerCase();

    // Branch flag: -b, -branch, --branch, -branchname, --branchname
    if (lower === '-b' || lower === '-branch' || lower === '--branch' || lower === '-branchname' || lower === '--branchname') {
      if (i + 1 < postPush.length && !postPush[i + 1].startsWith('-')) {
        branch = postPush[i + 1];
        i += 2;
        continue;
      }
    } else if (lower.startsWith('-b=') || lower.startsWith('-branch=') || lower.startsWith('--branch=')) {
      branch = token.split('=')[1];
      i++;
      continue;
    } else if (token.startsWith('-') && i + 1 < postPush.length && postPush[i + 1].toLowerCase() === 'branch') {
      // Handles e.g. -2nd branch or -main branch
      branch = token.replace(/^-+/, '');
      i += 2;
      continue;
    }

    // Commit message flags:
    // Can be: -m, -commit, --commit, or compound like: -m -commit, -commit -m
    if (lower === '-m' || lower === '-commit' || lower === '--commit') {
      // Check for compound flag: e.g. -m -commit "msg"
      if (i + 1 < postPush.length) {
        const nextLower = postPush[i + 1].toLowerCase();
        if (nextLower === '-commit' || nextLower === '-m' || nextLower === '--commit') {
          // Compound flag: value is at i + 2
          if (i + 2 < postPush.length) {
            message = postPush[i + 2];
            i += 3;
            continue;
          }
        } else if (!postPush[i + 1].startsWith('-')) {
          message = postPush[i + 1];
          i += 2;
          continue;
        }
      }
    } else if (lower.startsWith('-m=') || lower.startsWith('-commit=') || lower.startsWith('--commit=')) {
      message = token.split('=')[1];
      i++;
      continue;
    }

    // Positional file token if it does not start with flag
    if (!token.startsWith('-')) {
      files.push(token);
    }

    i++;
  }

  // Default files to ['.'] if none specified
  if (files.length === 0) {
    files = ['.'];
  }

  return {
    files,
    branch,
    message
  };
}

/**
 * Executes unified staging, committing, and pushing with automatic GitHub repo creation
 */
async function handlePush(rawArgs, context = {}) {
  const cyan = '\x1b[36m';
  const green = '\x1b[32m';
  const yellow = '\x1b[33m';
  const red = '\x1b[31m';
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';
  const dim = '\x1b[2m';

  const cwd = context.cwd || process.cwd();
  const parsed = parsePushArgs(rawArgs);

  // 1. Verify / Initialize Git repository
  let inGit = false;
  try {
    const res = runCapture('git rev-parse --is-inside-work-tree', { cwd });
    inGit = res.trim() === 'true';
  } catch {}

  if (!inGit) {
    console.log(`\n${yellow}[rapidfire-git] No git repository found in current directory.${reset}`);
    console.log(`${cyan}[rapidfire-git] Initializing git repository (main branch)...${reset}`);
    try {
      run('git init -b main', { cwd, stdio: 'ignore' });
    } catch {
      run('git init', { cwd, stdio: 'ignore' });
    }
  }

  // 2. Resolve target branch
  let currentBranch = 'main';
  try {
    currentBranch = runCapture('git branch --show-current', { cwd }).trim() || 'main';
  } catch {}

  const targetBranch = parsed.branch || currentBranch;
  if (parsed.branch && parsed.branch !== currentBranch) {
    let branchExists = false;
    try {
      runCapture(`git rev-parse --verify "${parsed.branch}"`, { cwd });
      branchExists = true;
    } catch {}

    try {
      if (branchExists) {
        run(`git checkout "${parsed.branch}"`, { cwd, stdio: 'ignore' });
      } else {
        run(`git checkout -b "${parsed.branch}"`, { cwd, stdio: 'ignore' });
      }
      console.log(`${cyan}[rapidfire-git] Switched to branch:${reset} ${targetBranch}`);
    } catch (checkoutErr) {
      console.error(`${red}[rapidfire-git] Failed to switch branch:${reset} ${checkoutErr.message}`);
    }
  }

  // 3. Stage specified files
  const addTarget = parsed.files.map((f) => `"${f}"`).join(' ');
  console.log(`\n${cyan}[rapidfire-git] Staging files:${reset} git add ${parsed.files.join(' ')}`);
  try {
    run(`git add ${addTarget}`, { cwd });
  } catch (addErr) {
    console.error(`${red}[rapidfire-git] Staging failed:${reset} ${addErr.message}`);
    return { success: false, error: addErr.message };
  }

  // 4. Resolve commit message
  let commitMessage = parsed.message;
  if (!commitMessage) {
    if (context.ask && typeof context.ask === 'function') {
      try {
        const answer = await context.ask('Enter commit message: ');
        commitMessage = answer?.trim();
      } catch {}
    }
    if (!commitMessage) {
      commitMessage = 'Update project files via RapidFire CLI';
    }
  }

  // 5. Commit staged changes if any exist
  let commitMade = false;
  let statusOutput = '';
  try {
    statusOutput = runCapture('git status --porcelain', { cwd }).trim();
  } catch {}

  if (statusOutput.length > 0) {
    console.log(`${cyan}[rapidfire-git] Committing:${reset} "${commitMessage}"`);
    try {
      const sanitizedMsg = commitMessage.replace(/"/g, '\\"');
      run(`git commit -m "${sanitizedMsg}"`, { cwd });
      commitMade = true;
    } catch (commitErr) {
      console.error(`${red}[rapidfire-git] Commit failed:${reset} ${commitErr.message}`);
      return { success: false, error: commitErr.message };
    }
  } else {
    console.log(`${dim}[rapidfire-git] Working tree clean; no new staged changes to commit.${reset}`);
  }

  // 6. Check for remote 'origin'
  let hasRemote = false;
  try {
    const remotes = runCapture('git remote', { cwd }).trim();
    hasRemote = remotes.split(/\r?\n/).some((r) => r.trim() === 'origin');
  } catch {}

  if (!hasRemote) {
    console.log(`\n${yellow}[rapidfire-git] No remote repository 'origin' linked.${reset}`);
    if (isGhInstalled() && isGhAuthenticated()) {
      const folderName = path.basename(cwd);
      console.log(`${cyan}[rapidfire-git] Creating GitHub repository '${folderName}' via GitHub CLI...${reset}`);
      const repoRes = createRepo(cwd, folderName, false);
      if (repoRes.success) {
        hasRemote = true;
        console.log(`${green}✔ GitHub repository created and linked to origin!${reset}`);
      } else {
        console.error(`${red}[rapidfire-git] Could not create GitHub repository: ${repoRes.message || repoRes.error}${reset}`);
        return { success: false, error: 'REPO_CREATION_FAILED' };
      }
    } else if (!isGhInstalled()) {
      console.log(`${dim}Tip: Install GitHub CLI (gh) to enable automatic remote repo creation, or link manually:${reset}`);
      console.log(`  git remote add origin <your-repo-url>`);
      return { success: false, error: 'NO_REMOTE' };
    } else {
      console.log(`${dim}Tip: Run "gh auth login" to authenticate GitHub CLI, or link manually:${reset}`);
      console.log(`  git remote add origin <your-repo-url>`);
      return { success: false, error: 'GH_UNAUTHENTICATED' };
    }
  }

  // 7. Push to remote
  console.log(`${cyan}[rapidfire-git] Pushing to origin/${targetBranch}...${reset}`);
  try {
    run(`git push -u origin "${targetBranch}"`, { cwd });
    if (commitMade) {
      console.log(`\n${green}${bold}✔ Successfully committed and pushed to origin/${targetBranch}!${reset}\n`);
    } else {
      console.log(`\n${cyan}${bold}✔ origin/${targetBranch} is up to date (no new changes to push).${reset}\n`);
    }
    return {
      success: true,
      branch: targetBranch,
      commitMade,
      message: commitMessage
    };
  } catch (pushErr) {
    console.error(`\n${red}[rapidfire-git] Push error:${reset} ${pushErr.message}\n`);
    return {
      success: false,
      error: pushErr.message
    };
  }
}

module.exports = {
  parseTokensWithQuotes,
  parsePushArgs,
  handlePush
};
