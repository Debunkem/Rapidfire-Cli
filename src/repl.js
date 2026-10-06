const readline = require('readline');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { PersistentShell } = require('./shell');
const { matchCommand } = require('./commands');

class RapidfireRepl {
  constructor() {
    this.shell = new PersistentShell();
    this.rl = null;
    this.isPassthroughRunning = false;
    this.idleTimer = null;
  }

  getPrompt() {
    const cwd = process.cwd();
    const isPwsh = Boolean(process.platform === 'win32' || process.env.PSModulePath || process.env.POWERSHELL_DISTRIBUTION_CHANNEL || process.env.RAPIDFIRE_PWSH);
    const prefix = isPwsh ? 'PS ' : '';
    return `\x1b[32m${prefix}${cwd}\x1b[36m(rapidfire)>\x1b[0m `;
  }

  prompt() {
    if (this.rl) {
      this.rl.setPrompt(this.getPrompt());
      this.rl.prompt();
    }
  }

  start() {
    this.printBanner();

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: this.getPrompt()
    });

    this.expectedEcho = null;

    // Pipe PTY output only when a pass-through command is running
    // This prevents bash startup prompt ([user@host cwd]$) from bleeding into initial screen
    this.shell.onData((data) => {
      if (this.isPassthroughRunning) {
        let chunk = data;

        // Clean internal PowerShell / subshell prompt strings so they don't collide with rapidfire prompt
        if (chunk) {
          chunk = chunk.replace(/PS\s+[^\r\n>]+>\s*/g, '');
        }

        // Strip the terminal driver's echo of the command typed by the user
        if (this.expectedEcho && chunk) {
          const trimmedEcho = this.expectedEcho.trim();
          const escaped = trimmedEcho.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp('^\\s*' + escaped + '(\\r?\\n)?');
          if (regex.test(chunk)) {
            chunk = chunk.replace(regex, '');
            this.expectedEcho = null;
          } else if (chunk.trim() === trimmedEcho) {
            chunk = '';
            this.expectedEcho = null;
          }
        }

        if (chunk) {
          process.stdout.write(chunk);
        }

        if (this.idleTimer) clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => {
          this.isPassthroughRunning = false;
          this.expectedEcho = null;
          this.prompt();
        }, 120);
      }
    });

    this.shell.onExit((code) => {
      console.log(`\n[rapidfire] Underlying shell exited with code ${code}.`);
      this.shutdown();
    });

    this.rl.on('line', async (rawLine) => {
      await this.handleLine(rawLine);
    });

    this.rl.on('close', () => {
      this.shutdown();
    });

    // Initial prompt
    this.prompt();
  }

  printBanner() {
    const bold = '\x1b[1m';
    const cyan = '\x1b[36m';
    const reset = '\x1b[0m';
    const dim = '\x1b[2m';

    console.log(`
${bold}${cyan}╔════════════════════════════════════════════════════╗
║               RAPIDFIRE CLI REPL                   ║
║   Persistent Shell Passthrough + Scaffolding REPL  ║
╚════════════════════════════════════════════════════╝${reset}
${dim}Type 'help' for built-in recipes, or run any standard shell command.${reset}
`);
  }

  async handleLine(rawLine) {
    // Strip bracketed-paste escape sequences if pasted into terminal
    const line = rawLine.replace(/\x1b\[200~|\x1b\[201~/g, '').trim();

    if (!line) {
      this.prompt();
      return;
    }

    // Check if line is a rapidfire internal command
    const matched = matchCommand(line);

    if (matched) {
      try {
        const result = await matched.run({ rl: this.rl });
        if (result && result.exit) {
          this.shutdown();
          return;
        }
      } catch (err) {
        console.error(`[rapidfire] Error executing command '${matched.name}':`, err.message);
      }
      this.prompt();
      return;
    }

    // Handle cd synchronization between Node process.cwd() and shell PTY
    this.handleCdSync(line);

    // Pass-through to underlying persistent shell
    this.isPassthroughRunning = true;
    this.expectedEcho = line;
    this.shell.write(line);

    // Safety fallback timer if the command produces no stdout (e.g. git add .)
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      if (this.isPassthroughRunning) {
        this.isPassthroughRunning = false;
        this.prompt();
      }
    }, 450);
  }

  handleCdSync(line) {
    const parts = line.split(/\s+/);
    if (parts[0] === 'cd') {
      const target = parts[1];
      let targetPath;
      if (!target || target === '~') {
        targetPath = os.homedir();
      } else if (target.startsWith('~/')) {
        targetPath = path.join(os.homedir(), target.slice(2));
      } else {
        targetPath = path.resolve(process.cwd(), target);
      }

      if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
        try {
          process.chdir(targetPath);
          this.rl.setPrompt(this.getPrompt());
        } catch {
          // If chdir fails in Node, shell will report error
        }
      }
    }
  }

  shutdown() {
    console.log('\n\x1b[33m[rapidfire] Exiting....\x1b[0m');
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.shell) {
      this.shell.kill();
    }
    process.exit(0);
  }
}

function startRepl() {
  const repl = new RapidfireRepl();
  repl.start();
  return repl;
}

module.exports = {
  RapidfireRepl,
  startRepl
};
