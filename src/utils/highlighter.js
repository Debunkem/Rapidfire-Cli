/**
 * In-terminal real-time syntax highlighter and tab completer for RapidFire REPL.
 * Mimics modern terminal styling (PowerShell PSReadLine and Fish shell).
 */

const RAPIDFIRE_COMMANDS = [
  'rapidfire',
  'rapidfire-cli',
  'setup',
  'explain',
  'ask',
  'suggest',
  'tell',
  'key',
  'preset',
  'presets',
  'save',
  'load',
  'list',
  'deploy',
  'help',
  'exit',
  'quit'
];

const SHELL_COMMANDS = [
  'init',
  'git',
  'cd',
  'ls',
  'dir',
  'npm',
  'npx',
  'node',
  'python',
  'python3',
  'pip',
  'pip3',
  'docker',
  'cat',
  'echo',
  'pwd',
  'mkdir',
  'rm',
  'cp',
  'mv',
  'touch',
  'curl',
  'wget',
  'code',
  'gh',
  'clear',
  'cls',
  'grep',
  'find',
  'pnpm',
  'yarn',
  'cargo',
  'go',
  'rustc',
  'which',
  'where'
];

const COMMON_SUBCOMMANDS = [
  'add',
  'commit',
  'push',
  'pull',
  'status',
  'checkout',
  'branch',
  'diff',
  'merge',
  'rebase',
  'clone',
  'install',
  'run',
  'start',
  'build',
  'test',
  'init',
  'status',
  'clear',
  'preset',
  'presets',
  'react+fastapi',
  'react+django',
  'react+node',
  'react+flask',
  'vue+fastapi',
  'vue+node',
  'vue+django',
  'svelte+node',
  'react',
  'vue',
  'svelte',
  'fastapi',
  'django'
];

const RECIPES = [
  'react+fastapi',
  'react+django',
  'react+node',
  'react+flask',
  'vue+fastapi',
  'vue+node',
  'vue+django',
  'svelte+node',
  'react',
  'vue',
  'svelte',
  'fastapi',
  'django'
];

/**
 * Highlights a command line string in real-time matching PowerShell styling:
 * - Primary commands (rapidfire, init, git, cd, setup, explain, etc.): Bright Yellow (\x1b[93m)
 * - Subcommands (add, commit, status, react, etc.): Cyan (\x1b[36m)
 * - Flags (-m, -v, --prod): Slate Gray (\x1b[90m)
 * - Strings ("...", '...', or unclosed "typing...): Cyan (\x1b[36m)
 */
function highlightSyntax(line) {
  if (!line) return '';

  const match = line.match(/^(\s*)([^\s]+)([\s\S]*)$/);
  if (!match) return line;

  const [_, leading, firstWord, rest] = match;
  const lowerFirst = firstWord.toLowerCase();

  let coloredFirst = firstWord;
  const allCommands = [...RAPIDFIRE_COMMANDS, ...SHELL_COMMANDS];
  if (allCommands.includes(lowerFirst)) {
    // Bright Yellow (PowerShell CommandColor)
    coloredFirst = `\x1b[93m${firstWord}\x1b[0m`;
  }

  let coloredRest = rest;

  // Highlight subcommands like "git add", "git commit", "setup react", "init git" in Cyan (\x1b[36m)
  const subMatch = coloredRest.match(/^(\s+)([^\s]+)([\s\S]*)$/);
  if (subMatch) {
    const [__, sp, subWord, afterSub] = subMatch;
    const subLower = subWord.toLowerCase();
    if (COMMON_SUBCOMMANDS.includes(subLower) || allCommands.includes(subLower) || subWord.includes('+')) {
      coloredRest = sp + `\x1b[36m${subWord}\x1b[0m` + afterSub;
    }
  }

  // Highlight CLI flags (-m, -v, --flag) in slate gray (\x1b[90m)
  coloredRest = coloredRest.replace(/(\s)(--?[a-zA-Z0-9_\-]+)/g, '$1\x1b[90m$2\x1b[0m');

  // Highlight string literals in Cyan (matching PowerShell PSReadLine StringColor)
  // Handles both closed strings ("...") and in-progress unclosed strings ("typing...)
  coloredRest = coloredRest.replace(/(["'])(?:.*?\1|[^"']*$)/g, (str) => {
    return `\x1b[36m${str}\x1b[0m`;
  });

  return leading + coloredFirst + coloredRest;
}

/**
 * Creates a tab autocompleter function compatible with readline.createInterface
 */
function createCompleter() {
  return function completer(line) {
    const trimmed = line.trimStart();
    const tokens = trimmed.split(/\s+/);

    if (tokens.length <= 1) {
      const allTop = [...RAPIDFIRE_COMMANDS, ...SHELL_COMMANDS];
      const hits = allTop.filter((c) => c.startsWith(trimmed.toLowerCase()));
      return [hits.length ? hits : allTop, trimmed];
    }

    const cmd = tokens[0].toLowerCase();
    if (cmd === 'setup') {
      const currentRecipe = tokens[1] ? tokens[1].toLowerCase() : '';
      const hits = RECIPES.filter((r) => r.startsWith(currentRecipe));
      const completions = hits.map((h) => `setup ${h}`);
      return [completions.length ? completions : RECIPES.map((r) => `setup ${r}`), line];
    }

    if (cmd === 'key') {
      const sub = tokens[1] ? tokens[1].toLowerCase() : '';
      const subs = ['status', 'clear'];
      const hits = subs.filter((s) => s.startsWith(sub)).map((s) => `key ${s}`);
      return [hits.length ? hits : subs.map((s) => `key ${s}`), line];
    }

    if (cmd === 'git') {
      const gitSubs = ['status', 'add', 'commit', 'push', 'pull', 'branch', 'checkout', 'diff', 'init'];
      const currentSub = tokens[1] ? tokens[1].toLowerCase() : '';
      const hits = gitSubs.filter((g) => g.startsWith(currentSub)).map((g) => `git ${g}`);
      return [hits.length ? hits : gitSubs.map((g) => `git ${g}`), line];
    }

    if (cmd === 'save' || cmd === 'load') {
      if (!tokens[1] || 'preset'.startsWith(tokens[1].toLowerCase())) {
        return [[`${cmd} preset `], line];
      }
    }

    return [[], line];
  };
}

module.exports = {
  RAPIDFIRE_COMMANDS,
  SHELL_COMMANDS,
  COMMON_SUBCOMMANDS,
  RECIPES,
  highlightSyntax,
  createCompleter
};
