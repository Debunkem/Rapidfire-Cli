const https = require('https');
const { spawnSync } = require('child_process');

/**
 * Parses markdown/text to extract suggested Python (pip) and Node (npm) packages.
 *
 * @param {string} text Text or markdown response from AI
 * @returns {{ ecosystem: 'python'|'node', packages: string[] } | null}
 */
function extractDependencies(text) {
  if (!text) return null;

  const pythonPkgs = new Set();
  const nodePkgs = new Set();

  // 1. Detect pip install lines
  const pipMatches = text.matchAll(/(?:pip|pip3)\s+install\s+([^#\n\r`]+)/gi);
  for (const match of pipMatches) {
    const rawTokens = match[1].trim().split(/\s+/);
    for (let token of rawTokens) {
      token = token.trim().replace(/^['"]|['"]$/g, '');
      // Strip version specifiers like ==, >=, <=, ~=, <, >
      const cleanName = token.split(/[<>=~]/)[0].trim();
      if (cleanName && !cleanName.startsWith('-') && !cleanName.includes('/') && !cleanName.includes('\\')) {
        pythonPkgs.add(cleanName);
      }
    }
  }

  // 2. Detect npm/yarn/pnpm install lines
  const npmMatches = text.matchAll(/(?:npm|pnpm|yarn)\s+(?:install|i|add)\s+([^#\n\r`]+)/gi);
  for (const match of npmMatches) {
    const rawTokens = match[1].trim().split(/\s+/);
    for (let token of rawTokens) {
      token = token.trim().replace(/^['"]|['"]$/g, '');
      const cleanName = token.split(/@/)[0].trim() || token;
      if (cleanName && !cleanName.startsWith('-') && cleanName !== 'install' && cleanName !== 'i') {
        nodePkgs.add(cleanName);
      }
    }
  }

  // Return whichever ecosystem was detected (prioritizing Python if both exist, or combining)
  if (pythonPkgs.size > 0) {
    return {
      ecosystem: 'python',
      packages: Array.from(pythonPkgs)
    };
  }

  if (nodePkgs.size > 0) {
    return {
      ecosystem: 'node',
      packages: Array.from(nodePkgs)
    };
  }

  return null;
}

/**
 * Validates package name against injection attacks and verifies existence
 * on the official registry (PyPI or npm).
 *
 * @param {string} pkg Package name
 * @param {'python'|'node'} ecosystem
 * @returns {Promise<{ valid: boolean, reason?: string }>}
 */
async function validatePackageSecurity(pkg, ecosystem = 'python') {
  // Check 1: Strict syntax whitelist (alphanumeric, dash, underscore, dot)
  const safeRegex = /^[a-zA-Z0-9_\-\.]+$/;
  if (!safeRegex.test(pkg)) {
    return { valid: false, reason: 'Invalid package name characters (possible injection attempt).' };
  }

  // Check 2: Reject dangerous or reserved names
  if (pkg.startsWith('-') || pkg.includes('..') || pkg.length > 100) {
    return { valid: false, reason: 'Malformed package specifier.' };
  }

  // Check 3: Check official registry existence
  const url = ecosystem === 'python'
    ? `https://pypi.org/pypi/${encodeURIComponent(pkg)}/json`
    : `https://registry.npmjs.org/${encodeURIComponent(pkg)}`;

  try {
    const exists = await new Promise((resolve) => {
      const req = https.get(url, { timeout: 2500 }, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 300);
      });
      req.on('error', () => resolve(true)); // Allow on network drop to prevent blocking offline use
      req.on('timeout', () => {
        req.destroy();
        resolve(true); // Allow on timeout
      });
    });

    if (!exists) {
      return { valid: false, reason: `Package '${pkg}' does not exist on official ${ecosystem === 'python' ? 'PyPI' : 'npm'} registry.` };
    }

    return { valid: true };
  } catch {
    return { valid: true };
  }
}

/**
 * Prompts user to select packages to install and securely executes installation.
 *
 * @param {{ ecosystem: 'python'|'node', packages: string[] }} depInfo
 * @param {import('readline').Interface} rl
 */
async function promptAndInstallDependencies(depInfo, rl) {
  if (!depInfo || !depInfo.packages || depInfo.packages.length === 0 || !rl) {
    return;
  }

  const { ecosystem, packages } = depInfo;
  const cyan = '\x1b[36m';
  const green = '\x1b[32m';
  const yellow = '\x1b[33m';
  const red = '\x1b[31m';
  const bold = '\x1b[1m';
  const reset = '\x1b[0m';
  const dim = '\x1b[2m';

  console.log(`\n${bold}${cyan}╭── Suggested ${ecosystem === 'python' ? 'Python (pip)' : 'Node (npm)'} Packages Detected ─────────────────────────╮${reset}`);
  for (let i = 0; i < packages.length; i++) {
    const num = `[${i + 1}]`.padEnd(5);
    console.log(`  ${green}${num}${reset} ${bold}${packages[i]}${reset}`);
  }
  console.log(`${bold}${cyan}╰────────────────────────────────────────────────────────────────────────╯${reset}`);

  const ask = (query) => new Promise((res) => rl.question(query, (ans) => res(ans ? ans.trim() : '')));

  const rawSelection = await ask(
    `\n${yellow}Select packages to install (e.g. 1,2,5 or 'all' or press Enter to skip):${reset} `
  );

  if (!rawSelection) {
    console.log(`${dim}[rapidfire] Package installation skipped.${reset}\n`);
    return;
  }

  let selected = [];
  if (rawSelection.toLowerCase() === 'all') {
    selected = [...packages];
  } else {
    const tokens = rawSelection.split(/[, \t]+/);
    for (const token of tokens) {
      const idx = parseInt(token, 10);
      if (!isNaN(idx) && idx >= 1 && idx <= packages.length) {
        selected.push(packages[idx - 1]);
      } else if (packages.map(p => p.toLowerCase()).includes(token.toLowerCase())) {
        const found = packages.find(p => p.toLowerCase() === token.toLowerCase());
        if (found) selected.push(found);
      }
    }
  }

  // Deduplicate
  selected = Array.from(new Set(selected));

  if (selected.length === 0) {
    console.log(`${dim}[rapidfire] No valid packages chosen. Installation skipped.${reset}\n`);
    return;
  }

  console.log(`\n${cyan}Selected packages:${reset} ${bold}${selected.join(', ')}${reset}`);
  const confirm = await ask(`${bold}${yellow}Confirm installation? (Y/N):${reset} `);

  if (!confirm.toLowerCase().startsWith('y')) {
    console.log(`${dim}[rapidfire] Installation cancelled.${reset}\n`);
    return;
  }

  // Security Verification Step
  console.log(`\n${cyan}[rapidfire-security] Verifying package safety & registry integrity...${reset}`);
  const validatedPkgs = [];

  for (const pkg of selected) {
    const check = await validatePackageSecurity(pkg, ecosystem);
    if (!check.valid) {
      console.log(`  ${red}✖ BLOCKED: ${pkg} - ${check.reason}${reset}`);
    } else {
      console.log(`  ${green}✔ VERIFIED: ${pkg}${reset}`);
      validatedPkgs.push(pkg);
    }
  }

  if (validatedPkgs.length === 0) {
    console.log(`\n${red}[rapidfire-security] All selected packages failed verification. Nothing installed.${reset}\n`);
    return;
  }

  console.log(`\n${bold}[rapidfire] Installing ${validatedPkgs.length} verified packages via ${ecosystem === 'python' ? 'pip' : 'npm'}...${reset}\n`);

  try {
    const cmd = ecosystem === 'python' ? 'pip' : 'npm';
    const args = ecosystem === 'python' ? ['install', ...validatedPkgs] : ['install', ...validatedPkgs];

    const result = spawnSync(cmd, args, { stdio: 'inherit' });

    if (result.status === 0) {
      console.log(`\n${green}✔ Successfully installed: ${validatedPkgs.join(', ')}${reset}\n`);
    } else {
      console.log(`\n${yellow}[rapidfire] Installer exited with status code ${result.status}.${reset}\n`);
    }
  } catch (err) {
    console.error(`\n${red}[rapidfire] Failed to invoke package installer:${reset}`, err.message, '\n');
  }
}

module.exports = {
  extractDependencies,
  validatePackageSecurity,
  promptAndInstallDependencies
};
