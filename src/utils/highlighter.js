/**
 * In-terminal real-time syntax highlighter and tab completer for RapidFire REPL.
 * Mimics modern terminal styling (e.g. PowerShell PSReadLine and Fish shell).
 */

const RAPIDFIRE_COMMANDS = [
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
 * Highlights a command line string in real-time.
 * - RapidFire commands: Bold Cyan
 * - Shell commands (init, git, etc.): Bold Yellow
 * - Recognized recipes: Bold Green
 * - CLI flags: Yellow
 * - Strings: Green
 */
function highlightSyntax(line) {
  if (!line) return '';

  const match = line.match(/^(\s*)([^\s]+)([\s\S]*)$/);
  if (!match) return line;

  const [_, leading, firstWord, rest] = match;
  const lowerFirst = firstWord.toLowerCase();

  let coloredFirst = firstWord;
  if (RAPIDFIRE_COMMANDS.includes(lowerFirst)) {
    coloredFirst = `\x1b[1;36m${firstWord}\x1b[0m`;
  } else if (SHELL_COMMANDS.includes(lowerFirst)) {
    coloredFirst = `\x1b[1;33m${firstWord}\x1b[0m`;
  }

  let coloredRest = rest;

  // Highlight recognized framework recipe if command is setup
  if (lowerFirst === 'setup') {
    const recipeMatch = coloredRest.match(/^(\s+)([^\s]+)([\s\S]*)$/);
    if (recipeMatch) {
      const [__, sp, recipeWord, afterRecipe] = recipeMatch;
      let colRecipe = recipeWord;
      if (RECIPES.includes(recipeWord.toLowerCase())) {
        colRecipe = `\x1b[1;32m${recipeWord}\x1b[0m`;
      }
      coloredRest = sp + colRecipe + afterRecipe;
    }
  }

  // Highlight strings: "..." or '...'
  coloredRest = coloredRest.replace(/(["'])(.*?)\1/g, '\x1b[32m$1$2$1\x1b[0m');

  // Highlight CLI flags: --something or -s
  coloredRest = coloredRest.replace(/(\s)(--?[a-zA-Z0-9_\-]+)/g, '$1\x1b[33m$2\x1b[0m');

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
  RECIPES,
  highlightSyntax,
  createCompleter
};
