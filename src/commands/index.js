const { showHelp } = require('./help');
const { handleSetup } = require('./setup');
const { handleSavePreset, handleLoadPreset, handleListPresets } = require('./preset');
const { handleAsk } = require('./ask');
const { handleSuggest } = require('./suggest');
const { handleDeploy } = require('./deploy');
const { handleTell } = require('./tell');
const { handleKey } = require('./key');
const { handleExplain } = require('./explain');

/**
 * Parses user input line and checks if it matches a rapidfire internal command.
 * Returns { name, run } if recognized, or null if it should pass through to shell.
 */
function matchCommand(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const tokens = trimmed.split(/\s+/);
  const cmd = tokens[0].toLowerCase();

  if (cmd === 'help') {
    return {
      name: 'help',
      run: async () => showHelp()
    };
  }

  if (cmd === 'exit' || cmd === 'quit') {
    return {
      name: 'exit',
      run: async () => ({ exit: true })
    };
  }

  if (cmd === 'init') {
    if (tokens.length > 1 && tokens[1].toLowerCase() !== 'rapidfire') {
      return {
        name: 'setup',
        run: async (context) => handleSetup(tokens.slice(1), context)
      };
    }
    return {
      name: 'init',
      run: async () => {
        console.log(`\n\x1b[36m[rapidfire]\x1b[0m RapidFire is active!`);
        console.log(`To scaffold a project, use: \x1b[33msetup <recipe> <folder>\x1b[0m`);
        console.log(`Type \x1b[36mhelp\x1b[0m to view all supported framework recipes.\n`);
      }
    };
  }

  if (cmd === 'setup') {
    return {
      name: 'setup',
      run: async (context) => handleSetup(tokens.slice(1), context)
    };
  }

  if (cmd === 'deploy') {
    return {
      name: 'deploy',
      run: async () => handleDeploy(tokens.slice(1))
    };
  }

  if (cmd === 'save' && tokens[1]?.toLowerCase() === 'preset') {
    return {
      name: 'save preset',
      run: async () => handleSavePreset(tokens.slice(2))
    };
  }

  if (cmd === 'load' && tokens[1]?.toLowerCase() === 'preset') {
    return {
      name: 'load preset',
      run: async () => handleLoadPreset(tokens.slice(2))
    };
  }

  if (
    (cmd === 'list' && tokens[1]?.toLowerCase() === 'presets') ||
    cmd === 'presets'
  ) {
    return {
      name: 'list presets',
      run: async () => handleListPresets()
    };
  }

  if (cmd === 'ask') {
    return {
      name: 'ask',
      run: async (context) => handleAsk(tokens.slice(1), context)
    };
  }

  if (cmd === 'suggest') {
    return {
      name: 'suggest',
      run: async (context) => handleSuggest(tokens.slice(1), context)
    };
  }

  if (cmd === 'tell') {
    return {
      name: 'tell',
      run: async (context) => handleTell(tokens.slice(1), context)
    };
  }

  if (cmd === 'key') {
    return {
      name: 'key',
      run: async () => handleKey(tokens.slice(1))
    };
  }

  if (cmd === 'explain') {
    return {
      name: 'explain',
      run: async () => handleExplain(tokens.slice(1))
    };
  }

  return null;
}

const COMMON_SUGGESTIONS = {
  recipe: 'setup',
  recipes: 'setup',
  create: 'setup',
  scaffold: 'setup',
  helpp: 'help',
  hlp: 'help',
  staup: 'setup',
  setpu: 'setup',
  explian: 'explain',
  explane: 'explain',
  presest: 'presets',
  preset: 'presets',
  sugest: 'suggest',
  asl: 'ask',
  deply: 'deploy'
};

function getKeywordSuggestion(word) {
  if (!word || typeof word !== 'string') return null;
  const lower = word.toLowerCase();
  if (COMMON_SUGGESTIONS[lower]) {
    return COMMON_SUGGESTIONS[lower];
  }
  return null;
}

module.exports = {
  matchCommand,
  getKeywordSuggestion
};
