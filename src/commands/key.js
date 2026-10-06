const { saveUserConfig, getUserConfig } = require('../utils/configPath');
const { getApiKey } = require('../ai/gemini');

/**
 * Handle 'key' command: configure, inspect, or clear the Gemini API Key
 * Usage:
 *   key <api_key>   - Save key to user config (~/.rapidfire/config.json)
 *   key status      - Check if key is configured (masked)
 *   key clear       - Clear saved key from user config
 */
function handleKey(args) {
  const sub = args[0]?.trim();

  if (!sub) {
    console.log('\n\x1b[36m╔════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[36m║           RAPIDFIRE API KEY CONFIGURATION          ║\x1b[0m');
    console.log('\x1b[36m╚════════════════════════════════════════════════════╝\x1b[0m\n');
    console.log('Usage:');
    console.log('  \x1b[32mkey <gemini-api-key>\x1b[0m   Save or update your Gemini API key');
    console.log('  \x1b[33mkey status\x1b[0m             Check active key status and source');
    console.log('  \x1b[31mkey clear\x1b[0m              Remove saved key from ~/.rapidfire/config.json');
    console.log('\nGet a free Gemini API key at: \x1b[36mhttps://aistudio.google.com/apikey\x1b[0m\n');
    return;
  }

  if (sub.toLowerCase() === 'status') {
    const activeKey = getApiKey();
    if (activeKey) {
      const masked = activeKey.length > 8
        ? `${activeKey.slice(0, 5)}...${activeKey.slice(-4)}`
        : '***';
      let source = '~/.rapidfire/config.json';
      if (process.env.GEMINI_API_KEY) source = 'process.env.GEMINI_API_KEY';
      else if (process.env.RAPIDFIRE_API_KEY) source = 'process.env.RAPIDFIRE_API_KEY';
      else if (getUserConfig()?.geminiApiKey) source = '~/.rapidfire/config.json';
      else source = '.env file';

      console.log(`\n\x1b[32m✔ Gemini API Key is configured!\x1b[0m`);
      console.log(`  Key:    \x1b[36m${masked}\x1b[0m`);
      console.log(`  Source: \x1b[35m${source}\x1b[0m\n`);
    } else {
      console.log(`\n\x1b[33m⚠ No Gemini API key configured.\x1b[0m`);
      console.log(`  Get a free key at \x1b[36mhttps://aistudio.google.com/apikey\x1b[0m`);
      console.log(`  Then run: \x1b[32mkey <your_key>\x1b[0m\n`);
    }
    return;
  }

  if (sub.toLowerCase() === 'clear') {
    saveUserConfig({ geminiApiKey: null });
    console.log(`\n\x1b[32m✔ Cleared Gemini API key from ~/.rapidfire/config.json.\x1b[0m\n`);
    return;
  }

  // Treat input as API key to save
  const newKey = sub;
  if (newKey.length < 8) {
    console.log(`\x1b[31m[rapidfire] Error: API key appears too short or invalid.\x1b[0m`);
    return;
  }

  saveUserConfig({ geminiApiKey: newKey });
  const masked = `${newKey.slice(0, 5)}...${newKey.slice(-4)}`;
  console.log(`\n\x1b[32m✔ Gemini API key saved successfully!\x1b[0m`);
  console.log(`  Stored in: ~/.rapidfire/config.json`);
  console.log(`  Active:    \x1b[36m${masked}\x1b[0m\n`);
}

/**
 * Proactively checks if an API key is set; if not, recommends it and prompts
 * user to input it interactively, saving it permanently.
 */
async function ensureOrPromptApiKey(context = {}) {
  const activeKey = getApiKey();
  if (activeKey) return true;

  console.log('\n\x1b[33m💡 [Recommended] Set your free Gemini API key to unlock full live AI reasoning & code generation:\x1b[0m');
  console.log('   Run: \x1b[32mkey <your_key>\x1b[0m');
  console.log('   Get a 100% free key (no credit card needed): \x1b[36mhttps://aistudio.google.com/apikey\x1b[0m\n');

  if (context && (context.rl || typeof context.ask === 'function')) {
    let entered = '';
    const promptText = '\x1b[1m\x1b[33mEnter your Gemini API key now (or press Enter to skip):\x1b[0m ';
    if (typeof context.ask === 'function') {
      entered = await context.ask(promptText);
    } else if (context.rl) {
      entered = await new Promise((resolve) => {
        context.rl.question(promptText, (ans) => resolve(ans ? ans.trim() : ''));
      });
    }

    if (entered && entered.trim().length >= 8) {
      const cleanKey = entered.trim();
      saveUserConfig({ geminiApiKey: cleanKey });
      const masked = `${cleanKey.slice(0, 5)}...${cleanKey.slice(-4)}`;
      console.log(`\x1b[32m✔ Gemini API key saved permanently to ~/.rapidfire/config.json!\x1b[0m`);
      console.log(`  Active: \x1b[36m${masked}\x1b[0m\n`);
      return true;
    }
  }

  return false;
}

module.exports = {
  handleKey,
  ensureOrPromptApiKey
};
