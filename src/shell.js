const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { ensurePath } = require('./utils/proc');

let pty = null;
try {
  pty = require('node-pty');
} catch {
  pty = null;
}

class ChildProcessPtyAdapter {
  constructor(proc) {
    this.proc = proc;
  }
  write(data) {
    if (this.proc && this.proc.stdin && !this.proc.stdin.destroyed) {
      this.proc.stdin.write(data);
    }
  }
  onData(cb) {
    if (this.proc && this.proc.stdout) {
      this.proc.stdout.on('data', (d) => cb(d.toString()));
    }
    if (this.proc && this.proc.stderr) {
      this.proc.stderr.on('data', (d) => cb(d.toString()));
    }
  }
  onExit(cb) {
    if (this.proc) {
      this.proc.on('close', (code) => cb({ exitCode: code }));
    }
  }
  resize() {}
  kill() {
    if (this.proc) this.proc.kill();
  }
}

function resolveShell() {
  if (process.env.RAPIDFIRE_SHELL) {
    return {
      shell: process.env.RAPIDFIRE_SHELL,
      args: []
    };
  }

  const isWindows = process.platform === 'win32';
  if (isWindows) {
    const ps = 'powershell.exe';
    return {
      shell: process.env.COMSPEC || ps,
      args: ['-NoLogo']
    };
  }

  if (process.platform === 'darwin') {
    const macShell = process.env.SHELL || '/bin/zsh';
    return {
      shell: macShell,
      args: ['-l']
    };
  }

  // On Linux, detect pwsh vs bash/zsh
  const userShell = process.env.SHELL || '/bin/bash';
  if (userShell.includes('pwsh') || userShell.includes('powershell')) {
    return {
      shell: userShell,
      args: ['-NoLogo']
    };
  }
  return {
    shell: userShell,
    args: ['--login']
  };
}

class PersistentShell {
  constructor() {
    this.ptyProcess = null;
    this.shellName = null;
    this.dataListeners = [];
    this.exitListeners = [];
    this.init();
  }

  resolveShell() {
    return resolveShell();
  }

  init() {
    ensurePath();
    const { shell, args } = this.resolveShell();
    this.shellName = path.basename(shell);

    const cols = process.stdout.columns || 80;
    const rows = process.stdout.rows || 24;

    if (pty) {
      try {
        this.ptyProcess = pty.spawn(shell, args, {
          name: 'xterm-256color',
          cols,
          rows,
          cwd: process.cwd(),
          env: {
            ...process.env,
            TERM: 'xterm-256color'
          }
        });
      } catch {
        // Fallback to /bin/sh or child_process
        try {
          this.ptyProcess = pty.spawn('/bin/sh', [], {
            name: 'xterm-256color',
            cols,
            rows,
            cwd: process.cwd(),
            env: process.env
          });
          this.shellName = 'sh';
        } catch {
          this.ptyProcess = null;
        }
      }
    }

    if (!this.ptyProcess) {
      // Robust standard spawn fallback for environments without native PTY binaries
      const cpProc = spawn(shell, args, {
        cwd: process.cwd(),
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      this.ptyProcess = new ChildProcessPtyAdapter(cpProc);
    }

    this.ptyProcess.onData((data) => {
      // If shell queries cursor position report (\u001b[6n) e.g. PowerShell PSReadLine, answer CPR immediately
      if (typeof data === 'string' && data.includes('\u001b[6n')) {
        this.ptyProcess.write('\u001b[1;1R');
      }
      for (const listener of this.dataListeners) {
        listener(data);
      }
    });

    this.ptyProcess.onExit((code) => {
      for (const listener of this.exitListeners) {
        listener(code);
      }
    });

    // Handle terminal resize events
    process.stdout.on('resize', () => {
      this.resize(process.stdout.columns || 80, process.stdout.rows || 24);
    });
  }

  onData(listener) {
    this.dataListeners.push(listener);
  }

  onExit(listener) {
    this.exitListeners.push(listener);
  }

  write(input) {
    if (this.ptyProcess) {
      this.ptyProcess.write(input + '\n');
    }
  }

  resize(cols, rows) {
    if (this.ptyProcess && cols > 0 && rows > 0) {
      try {
        this.ptyProcess.resize(cols, rows);
      } catch {
        // Ignore resize errors if pty is transitioning
      }
    }
  }

  kill() {
    if (this.ptyProcess) {
      try {
        this.ptyProcess.kill();
      } catch {
        // Process might already be exited
      }
      this.ptyProcess = null;
    }
  }
}

module.exports = {
  PersistentShell,
  resolveShell
};
