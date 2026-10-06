const fs = require('fs');
const path = require('path');
const os = require('os');
const { getRapidfireDir } = require('./configPath');

/**
 * Returns potential history file locations for the current host operating system
 */
function getHostHistoryPaths() {
  const home = os.homedir();
  const paths = [];

  const isWindows = process.platform === 'win32';
  if (isWindows) {
    const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
    paths.push(path.join(appData, 'Microsoft', 'Windows', 'PowerShell', 'PSReadLine', 'ConsoleHost_history.txt'));
    paths.push(path.join(home, '.bash_history'));
  } else {
    // Linux and macOS
    paths.push(path.join(home, '.local', 'share', 'powershell', 'PSReadLine', 'ConsoleHost_history.txt'));
    paths.push(path.join(home, '.bash_history'));
    paths.push(path.join(home, '.zsh_history'));
  }

  // RapidFire dedicated persistent history
  const rfDir = getRapidfireDir ? getRapidfireDir() : path.join(home, '.rapidfire');
  paths.push(path.join(rfDir, 'history.txt'));

  return paths;
}

/**
 * Resolves the primary active host shell history file based on active shell and mtime
 */
function getActiveHostHistoryPath() {
  const home = os.homedir();
  const isWindows = process.platform === 'win32';
  const isPwsh = Boolean(
    isWindows ||
    process.env.PSModulePath ||
    process.env.POWERSHELL_DISTRIBUTION_CHANNEL ||
    (process.env.SHELL && (process.env.SHELL.includes('pwsh') || process.env.SHELL.includes('powershell')))
  );

  if (isPwsh) {
    if (isWindows) {
      const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
      const pwshPath = path.join(appData, 'Microsoft', 'Windows', 'PowerShell', 'PSReadLine', 'ConsoleHost_history.txt');
      if (fs.existsSync(pwshPath)) return pwshPath;
    } else {
      const pwshPath = path.join(home, '.local', 'share', 'powershell', 'PSReadLine', 'ConsoleHost_history.txt');
      if (fs.existsSync(pwshPath)) return pwshPath;
    }
  }

  const userShell = process.env.SHELL || '';
  if (userShell.includes('zsh')) {
    const zshPath = path.join(home, '.zsh_history');
    if (fs.existsSync(zshPath)) return zshPath;
  }

  if (userShell.includes('bash')) {
    const bashPath = path.join(home, '.bash_history');
    if (fs.existsSync(bashPath)) return bashPath;
  }

  // Fallback: prioritize the candidate that exists and was most recently modified
  const candidates = [
    path.join(home, '.local', 'share', 'powershell', 'PSReadLine', 'ConsoleHost_history.txt'),
    path.join(home, '.bash_history'),
    path.join(home, '.zsh_history')
  ];
  let best = null;
  let bestMtime = 0;
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) {
        const stat = fs.statSync(c);
        if (stat.mtimeMs > bestMtime) {
          bestMtime = stat.mtimeMs;
          best = c;
        }
      }
    } catch {}
  }
  return best;
}

/**
 * Finds the primary active host history file that exists on disk
 */
function getPrimaryHostHistoryPath() {
  const active = getActiveHostHistoryPath();
  if (active) return active;

  const paths = getHostHistoryPaths();
  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  // Fallback to RapidFire default history path
  const home = os.homedir();
  const rfDir = getRapidfireDir ? getRapidfireDir() : path.join(home, '.rapidfire');
  return path.join(rfDir, 'history.txt');
}

/**
 * Sanitizes command lines, filtering out binary/corrupt lines, internal markers, and empty spaces
 */
function sanitizeCommandLine(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let line = raw.trim();
  if (!line) return null;

  // Filter lines containing non-printable binary control characters
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(line)) {
    return null;
  }

  // Filter out internal sentinel markers, test artifacts, or rapidfire internal markers
  if (line.includes('__RF_DONE__') || line.includes('__RF_') || line.includes('__rapidfire_')) {
    return null;
  }

  // Filter Zsh timestamp prefix (: 1620000000:0;command)
  const zshMatch = line.match(/^:\s*\d+:\d+;(.*)$/);
  if (zshMatch) {
    line = zshMatch[1].trim();
  }

  return line;
}

/**
 * Reads recent commands from host and RapidFire history files
 * Returns a reverse-chronological array ready for readline.history (index 0 = newest)
 */
function loadHistory(limit = 100) {
  const historyLines = [];
  const home = os.homedir();
  const rfDir = getRapidfireDir ? getRapidfireDir() : path.join(home, '.rapidfire');
  const rfPath = path.join(rfDir, 'history.txt');

  // Load order: RapidFire persistent history first, then active host shell history second
  // This ensures host commands executed immediately before starting RapidFire (e.g. git add .) are newest
  const pathsToLoad = [];
  if (fs.existsSync(rfPath)) {
    pathsToLoad.push(rfPath);
  }

  const hostPath = getActiveHostHistoryPath();
  if (hostPath && hostPath !== rfPath && fs.existsSync(hostPath)) {
    pathsToLoad.push(hostPath);
  } else if (!pathsToLoad.length) {
    // If neither found, scan candidate list
    const candidates = getHostHistoryPaths();
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        pathsToLoad.push(p);
        break;
      }
    }
  }

  for (const filePath of pathsToLoad) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const rawLines = content.split(/\r?\n/);

      for (const raw of rawLines) {
        const clean = sanitizeCommandLine(raw);
        if (!clean) continue;
        historyLines.push(clean);
      }
    } catch {
      // Ignore unreadable history files
    }
  }

  if (historyLines.length === 0) {
    return [];
  }

  // Deduplicate consecutive lines while preserving order
  const deduped = [];
  let prev = null;
  for (const cmd of historyLines) {
    if (cmd !== prev) {
      deduped.push(cmd);
      prev = cmd;
    }
  }

  // Take the most recent `limit` commands
  const recent = deduped.slice(-limit);

  // Readline expects index 0 to be the most recent command (Up Arrow starts at 0)
  return recent.reverse();
}

/**
 * Appends commands executed during the RapidFire session back to disk
 * Saves to both the primary host history and ~/.rapidfire/history.txt
 */
function saveSessionHistory(sessionCommands) {
  if (!Array.isArray(sessionCommands) || sessionCommands.length === 0) {
    return;
  }

  const cleanCommands = [];
  let last = null;
  for (const raw of sessionCommands) {
    const clean = sanitizeCommandLine(raw);
    if (!clean) continue;
    // Don't record internal exit commands
    if (clean === 'exit' || clean === 'quit') continue;
    if (clean !== last) {
      cleanCommands.push(clean);
      last = clean;
    }
  }

  if (cleanCommands.length === 0) return;

  const textToAppend = cleanCommands.join('\n') + '\n';

  // 1. Save to RapidFire persistent history
  const home = os.homedir();
  const rfDir = getRapidfireDir ? getRapidfireDir() : path.join(home, '.rapidfire');
  try {
    if (!fs.existsSync(rfDir)) {
      fs.mkdirSync(rfDir, { recursive: true, mode: 0o700 });
    }
    const rfHistPath = path.join(rfDir, 'history.txt');
    fs.appendFileSync(rfHistPath, textToAppend, 'utf8');
  } catch {}

  // 2. Append to host shell history file (e.g. ConsoleHost_history.txt / .bash_history)
  const hostPath = getPrimaryHostHistoryPath();
  if (hostPath && !hostPath.includes('.rapidfire')) {
    try {
      const dir = path.dirname(hostPath);
      if (fs.existsSync(dir)) {
        fs.appendFileSync(hostPath, textToAppend, 'utf8');
      }
    } catch {}
  }
}

module.exports = {
  getHostHistoryPaths,
  getActiveHostHistoryPath,
  getPrimaryHostHistoryPath,
  sanitizeCommandLine,
  loadHistory,
  saveSessionHistory
};
