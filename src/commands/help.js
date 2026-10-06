function showHelp() {
  const cyan = '\x1b[36m';
  const green = '\x1b[32m';
  const yellow = '\x1b[33m';
  const magenta = '\x1b[35m';
  const bold = '\x1b[1m';
  const reset = '\x1b[0m';
  const dim = '\x1b[2m';

  console.log(`
${bold}${cyan}╔══════════════════════════════════════════════════════════════════╗
║                     RAPIDFIRE CLI MANUAL                         ║
║         Persistent Shell Passthrough + Scaffolding REPL          ║
╚══════════════════════════════════════════════════════════════════╝${reset}

${bold}PROJECT SCAFFOLDING RECIPES (7 FRAMEWORKS / 13 OPTIONS):${reset}
  ${cyan}Connected Full-Stack Recipes:${reset}
    ${green}setup react+fastapi <folder>${reset}   React (Vite) + FastAPI (Async Python)
    ${green}setup react+django <folder>${reset}    React (Vite) + Django REST backend
    ${green}setup react+node <folder>${reset}      React (Vite) + Express Node.js backend
    ${green}setup react+flask <folder>${reset}     React (Vite) + Flask Python backend
    ${green}setup vue+fastapi <folder>${reset}     Vue 3 (Vite) + FastAPI (Async Python)
    ${green}setup vue+node <folder>${reset}        Vue 3 (Vite) + Express Node.js backend
    ${green}setup vue+django <folder>${reset}      Vue 3 (Vite) + Django REST backend
    ${green}setup svelte+node <folder>${reset}     Svelte (Vite) + Express Node.js backend

  ${cyan}Standalone Frontends:${reset}
    ${green}setup react <folder>${reset}          Standalone React (Vite) project
    ${green}setup vue <folder>${reset}            Standalone Vue 3 (Vite) project
    ${green}setup svelte <folder>${reset}         Standalone Svelte (Vite) project

  ${cyan}Standalone Backends:${reset}
    ${green}setup fastapi <folder>${reset}         Standalone high-performance FastAPI backend
    ${green}setup django <folder>${reset}          Standalone Django backend with SQLite

${bold}AI CODE GENERATION & ASSISTANCE (GEMINI FREE TIER):${reset}
  ${magenta}explain [file|folder]${reset}         Explain codebase architecture or file role
                                (e.g. "explain src/repl.js" or "explain .")
  ${magenta}tell <instruction>${reset}            Instruct AI to generate files & code with preview & (Y/N) confirmation
                                (e.g. "tell create 2 cpp files named m1 m2")
  ${magenta}suggest <description>${reset}         AI recommends stack + asks (Y/N) to automatically scaffold
  ${magenta}ask <question>${reset}                Ask technical questions inline with conversational memory
  ${magenta}ask clear${reset}                     Reset/clear multi-turn conversation memory

${bold}GEMINI API KEY CONFIGURATION:${reset}
  ${magenta}key <gemini-key>${reset}              Save or update your Gemini API key
  ${magenta}key status${reset}                    Show active key status (masked: AIzaS...1234) and source
  ${magenta}key clear${reset}                     Remove saved key from ~/.rapidfire/config.json

${bold}DEPLOYMENT & CLOUD:${reset}
  ${cyan}deploy [folder]${reset}                Deploy frontend to Vercel & extract Live URL

${bold}PROJECT PRESETS:${reset}
  ${yellow}save preset <name> [folder]${reset}    Serialize project tree & manifest to ~/.rapidfire/presets/
  ${yellow}load preset <name> <folder>${reset}    Restore project from saved JSON preset
  ${yellow}presets${reset}                        List all saved presets

${bold}SESSION COMMANDS:${reset}
  ${cyan}help${reset}                           Display this command reference
  ${cyan}exit${reset} / ${cyan}quit${reset}                    Exit Rapidfire cleanly

${bold}SHELL PASSTHROUGH:${reset}
  ${dim}Any other command (e.g. ls, git, pwd, cd, docker, npm, gh) is piped directly into
  the underlying persistent shell session. Environment variables, git status, and
  current directory are preserved.${reset}
`);
}

module.exports = {
  showHelp
};
