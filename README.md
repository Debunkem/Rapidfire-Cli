# RapidFire CLI

[![npm version](https://img.shields.io/npm/v/rapidfire-cli.svg?style=flat-square&color=007acc)](https://www.npmjs.com/package/rapidfire-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933.svg?style=flat-square&logo=nodedotjs)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg?style=flat-square)](https://github.com/Debunkem/rapidfire-cli)
[![Pricing](https://img.shields.io/badge/Cost-%240.00%20(100%25%20Free)-success.svg?style=flat-square)](https://github.com/Debunkem/rapidfire-cli)

**The High-Speed, Security-Hardened Developer Shell & Full-Stack Scaffolder**

RapidFire is an interactive terminal overlay and persistent developer workspace that combines instant multi-framework project scaffolding, official Long-Term Support (LTS) dependencies, automated pre-push secret scanning (GitLeaks), one-click in-terminal package installation, and modular AI assistance into one unified workflow.

[Installation](#installation-guide) • [Interactive Package Installer](#interactive-in-terminal-package-installer) • [Security Guardrails](#enterprise-grade-security-guardrails) • [Scaffolding Recipes](#scaffolding-recipes--lts-stack) • [Commands](#command-reference)

---

## Table of Contents

| # | Section | Overview & Key Capabilities | Navigation |
|---|---|---|:---:|
| 01 | **Architecture & Value Proposition** | Persistent PTY shell overlay, zero-cloud architecture, local dev environment | [View](#architecture--value-proposition) |
| 02 | **Cost & Local Execution FAQ** | 100% free pricing model, local execution details, API key ownership | [View](#cost--local-execution-faq) |
| 03 | **Installation Guide** | Global npm setup, local development clone, dependency setup | [View](#installation-guide) |
| 04 | **Complete Uninstallation Guide** | Clean package removal, deleting configuration, keys & saved presets | [View](#complete-uninstallation--deletion-guide) |
| 05 | **In-Terminal Package Installer** | Contextual dependency detection, injection protection, 1-click install | [View](#interactive-in-terminal-package-installer) |
| 06 | **Enterprise-Grade Security Guardrails** | GitLeaks pre-push scanner, package regex checks, preview approvals | [View](#enterprise-grade-security-guardrails) |
| 07 | **Scaffolding Recipes & LTS Stack** | 13 connected & standalone frameworks, pinned LTS runtimes, pre-flight checks | [View](#scaffolding-recipes--lts-stack) |
| 08 | **AI Provider & API Key Management** | Pluggable providers (Groq, OpenAI, Gemini, Ollama), auto key detection | [View](#ai-provider--api-key-management) |
| 09 | **Unified Git & GitHub Automation** | Single-command staging, commit, push, and automated `gh` repository creation | [View](#unified-git--github-automation) |
| 10 | **Bidirectional History & Highlighting** | Bidirectional shell history sync (Bash/Zsh/PowerShell), live syntax highlighting | [View](#bidirectional-terminal-history--real-time-highlighting) |
| 11 | **Command Reference** | Comprehensive quick-reference table for all RapidFire commands | [View](#command-reference) |
| 12 | **Testing & Verification** | 24 automated test suites, simulated remotes, security audit checks | [View](#testing--verification) |
| 13 | **License** | Open-source MIT license details | [View](#license) |

---

## Architecture & Value Proposition

RapidFire runs directly on your local computer as a persistent PTY terminal overlay. Any standard terminal command (`ls`, `git`, `cd`, `npm`, `python`, `docker`) runs seamlessly through your native shell while preserving working directory state and environment variables.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           RAPIDFIRE DEVELOPER SHELL                          │
├───────────────────────────────┬──────────────────────────────────────────────┤
│ Full-Stack Scaffolder         │ Pluggable AI Assistant                       │
│  • 13 Connected Stack Recipes │  • ask: Multi-turn Q&A + 1-Click Installer   │
│  • Bundled 100% Offline       │  • suggest: Interactive (Y/N) Stack Planner  │
│  • Pinned Official LTS Stacks │  • tell: Multi-file Generation with Preview  │
│  • Proactive Runtime Checks   │  • Persistent Local Key Storage (0600)       │
├───────────────────────────────┼──────────────────────────────────────────────┤
│ 5-Pillar Security Suite       │ Productivity & Automation                    │
│  • Automated GitLeaks Hook    │  • Bidirectional Shell History (PS/Bash/Zsh) │
│  • PyPI & npm Registry Checks │  • Real-Time Syntax Highlighting & Complete  │
│  • Path Traversal Defense     │  • Directory & Workspace Presets (JSON)      │
│  • Safe Deployment Approvals  │  • Interactive Python venv Auto-Setup        │
│  • Clean Git Verification     │  • One-Command Production Vercel Deploys     │
└────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## Cost & Local Execution FAQ

### Is RapidFire a cloud service? Does it cost money?
**No. RapidFire is 100% Free and Open Source ($0.00). It runs entirely on your local machine.**

| Question | Answer |
|---|---|
| **Does it run in the cloud?** | **No.** RapidFire runs entirely locally on your computer using your local Node.js engine and CPU. |
| **Are there any server costs?** | **$0.00.** There are no hosted servers, no subscriptions, and no credit card requirements. |
| **Does the AI cost anything?** | **No.** RapidFire supports free-tier API keys (such as Groq or free provider keys) as well as 100% free offline local models (via Ollama). You can get started with zero cost. |
| **Where is my data stored?** | **100% on your machine.** Your API key and project presets are saved locally in `~/.rapidfire/config.json`. No telemetry or project data is ever transmitted to external servers. |

---

## Installation Guide

Install RapidFire system-wide on your machine using npm:

```bash
npm install -g rapidfire-cli
```

Once installed, you can launch RapidFire from **any directory or terminal**:
```bash
rapidfire
# or
rapidfire-cli
```

### Local Developer Clone
If you are developing or contributing to the RapidFire codebase:
```bash
git clone https://github.com/Debunkem/rapidfire-cli.git
cd miniproject
npm install
npm test      # Runs all 22 automated test suites
npm start     # Starts local REPL
```

---

## Complete Uninstallation & Deletion Guide

If you ever wish to remove RapidFire and all associated local files from your system:

### Step 1: Remove the Global Package
```bash
npm uninstall -g rapidfire-cli
```

### Step 2: Delete Configuration, Keys & Saved Presets
RapidFire stores your API key and custom presets in your local user directory under `~/.rapidfire`. To erase all local configuration:

- **Linux & macOS**:
  ```bash
  rm -rf ~/.rapidfire
  ```

- **Windows (PowerShell)**:
  ```powershell
  Remove-Item -Recurse -Force ~/.rapidfire
  ```

- **Windows (Command Prompt / CMD)**:
  ```cmd
  rmdir /s /q "%USERPROFILE%\.rapidfire"
  ```

---

## Interactive In-Terminal Package Installer

One of RapidFire's core productivity features is its **Autonomous Dependency Detection & One-Click Installer** inside the `ask` command.

When you ask RapidFire a technical question:
```text
rapidfire> ask "How do I make HTTP requests in React and format dates?"
```

RapidFire's AI analyzes your query and responds with implementation guidance. Concurrently, RapidFire's underlying engine automatically parses the response for recommended `npm` or `pip` dependencies and presents an interactive installation checklist directly in your terminal:

```text
╭── Suggested Node (npm) Packages Detected ─────────────────────────╮
  [1]   axios
  [2]   date-fns
╰───────────────────────────────────────────────────────────────────╯

Select packages to install (e.g. 1,2 or 'all' or press Enter to skip): 1,2

Selected packages: axios, date-fns
Confirm installation? (Y/N): Y

[rapidfire-security] Verifying package safety & registry integrity...
  [OK] VERIFIED: axios
  [OK] VERIFIED: date-fns

[rapidfire] Installing 2 verified packages via npm...
[OK] Successfully installed: axios, date-fns
```

### Why this is safer than manual terminal installation:
1. **Interactive Multi-Select**: Enter `1,2`, `all`, or simply press `Enter` to skip without running any commands.
2. **Registry Verification**: RapidFire checks the live PyPI (`pypi.org`) or npm registry (`registry.npmjs.org`) to confirm the package exists before executing installation commands.
3. **Typo & Injection Shield**: Package names with invalid characters, path traversals, or flag injections (e.g., `--extra-index-url`) are automatically identified and blocked.

---

## Enterprise-Grade Security Guardrails

RapidFire is built from the ground up with defensive engineering principles. Every command that touches disk, processes packages, or talks to git adheres to **5 distinct security pillars**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       5 PILLARS OF RAPIDFIRE SECURITY                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. GitLeaks Secret Protection        → Automated pre-push git hook          │
│ 2. Package Registry Verification     → Injection shield & PyPI/npm checks   │
│ 3. Path Traversal & File Safety      → Sanitized paths & preview approvals  │
│ 4. Guarded Cloud Deployment          → Clean git check & manual Y/N prompt  │
│ 5. Local Credential Isolation        → Masked keys & restricted 0600 perms  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1. GitLeaks Pre-Push Secret Scanning
* Every project scaffolded with `setup` automatically initializes Git and installs a **`.git/hooks/pre-push`** security hook.
* Before any code is pushed to a remote repository (`git push`), RapidFire scans outgoing commit diffs for exposed credentials (API keys, private keys, AWS tokens, GitHub PATs).
* If sensitive credentials are detected, the push is immediately halted, preventing security leaks before they reach the web.

### 2. Dependency Injection & Typo-Squatting Defense
* When installing packages via the interactive installer, RapidFire validates package identifiers against a strict regex whitelist (`/^[a-zA-Z0-9_\-\.]+$/`).
* Flags (starting with `-`), directory traversals (`..`), or abnormal strings are rejected.
* Live registry queries verify the package belongs to the legitimate registry before spawning `npm install` or `pip install`.

### 3. Safe Generative Code Writing (`tell`)
* When using `tell <instruction>` to generate code files:
  - RapidFire inspects proposed file paths to ensure they remain inside the active project directory. Path traversals (`../`) outside the workspace root are blocked.
  - RapidFire displays a structured generation preview (showing all files and line counts) and requires explicit confirmation: `Confirm file generation? (Y/N): `.

### 4. Guarded Production Deployments (`deploy`)
* The `deploy vercel` command never executes silently.
* RapidFire first verifies that the Git working tree is clean so untracked secrets or staging files are not accidentally deployed.
* Requires explicit user verification (`Confirm Vercel deployment? (Y/N): `) before calling the Vercel CLI.

### 5. Local Credential Privacy
* Your AI API key is stored strictly on your local filesystem at `~/.rapidfire/config.json` with restricted permissions (`0600` on POSIX systems).
* Commands like `key status` mask your key (e.g., `sk-...1234` or `gsk_...1234`) to protect against shoulder-surfing during presentations or screen sharing.

---

## Scaffolding Recipes & LTS Stack

All templates are bundled locally inside the package distribution—scaffolding takes **seconds** and requires **zero git clones**.

### Full-Stack Connected Recipes
| Recipe Command | Frontend | Backend | Features |
|---|---|---|---|
| `setup react+fastapi <dir>` | React 18 LTS (Vite) | Python FastAPI | Connected CORS, auto Swagger docs (`/docs`) |
| `setup react+django <dir>` | React 18 LTS (Vite) | Django LTS REST | Ready-to-use Django REST API & models |
| `setup react+node <dir>` | React 18 LTS (Vite) | Express 4 LTS | Concurrent dev scripts, CORS pre-configured |
| `setup vue+fastapi <dir>` | Vue 3 LTS (Vite) | Python FastAPI | Interactive Vue 3 UI + FastAPI backend |
| `setup vue+node <dir>` | Vue 3 LTS (Vite) | Express 4 LTS | Full-stack JavaScript/Node architecture |
| `setup vue+django <dir>` | Vue 3 LTS (Vite) | Django LTS REST | Vue 3 SPA + Django REST framework |
| `setup react+flask <dir>` | React 18 LTS (Vite) | Python Flask | Lightweight Python REST endpoints |
| `setup svelte+node <dir>` | Svelte (Vite) | Express 4 LTS | High-performance reactive UI + Express API |

### Standalone Frontend & Backend Recipes
| Recipe Command | Framework | Version / Details |
|---|---|---|
| `setup react <dir>` | React (Vite) | React 18 LTS (`^18.3.1`) |
| `setup vue <dir>` | Vue 3 (Vite) | Vue 3 LTS (`^3.5.0`) |
| `setup svelte <dir>` | Svelte (Vite) | Modern Vite Svelte SPA |
| `setup fastapi <dir>` | FastAPI | `fastapi>=0.115.0`, `uvicorn>=0.32.0` |
| `setup django <dir>` | Django | Official Django LTS (`Django>=4.2,<6.0`) |

### Proactive Runtime Pre-Flight Checks
Before touching your filesystem, RapidFire runs runtime diagnostics:
- Verifies **Node.js LTS** (`>=18.0.0`) and **npm** are available.
- Verifies **Python 3** and **Django CLI** for Python-based stacks.
- If a required runtime is missing, RapidFire cleanly halts and outputs copy-paste installation commands tailored specifically to your operating system (Windows `winget`, macOS `brew`, Linux `apt`/`dnf`/`pacman`).

---

## AI Provider & API Key Management

RapidFire features a pluggable AI subsystem with automatic key detection. Just paste your API key—RapidFire auto-detects the provider and configures the optimal free-tier or fast model:

* **Groq** (`gsk_...`) -> Free-tier `llama-3.3-70b-versatile`
* **OpenAI** (`sk-...`) -> Fast `gpt-4o-mini`
* **Gemini** (`AIza...`) -> Fast `gemini-2.5-flash`
* **Ollama / Custom** -> Local or custom OpenAI-compatible endpoints

```bash
# Save or update your key (auto-detects provider & default model)
key <your_api_key>

# View active provider, model, masked key, and source
key status

# Optional: Override the default model
key model <model-name>

# Remove saved credentials
key clear
```

- **Update Anytime**: Running `key <new_key>` immediately updates your active provider and key.

---

## Unified Git & GitHub Automation

RapidFire unifies staging, committing, and pushing into a single, intuitive command:

```bash
git add <files> push [-b <branch>|-m] -commit "<message>"
```

### Key Capabilities
* **Flexible Staging**: Stage all files with `.` or stage individual files (e.g., `git add README.md ...` or `git add src/app.js ...`).
* **Active Branch (Default)**: If no branch flag is specified, RapidFire automatically stages, commits, and pushes to your current active branch.
* **Branch Targeting**:
  * **Main Branch**: Target `main` using `-m` or `-main` when paired with `-commit` (e.g., `git add . push -m -commit "message"`).
  * **Specific Branch**: Target any branch using `-b <branch>` or `-branch <branch>` (e.g., `git add . push -b feature1 -commit "message"`). If the branch does not exist locally, RapidFire automatically creates and switches to the new branch before committing and pushing.
* **Commit Message**: Provide your commit message using `-commit "<message>"` or standard `-m "<message>"` (when not targeting a branch). Compound flags like `-m -commit "<message>"` target `main` with the specified commit message.
* **Automatic Rebase Recovery**: If remote `origin` has newer commits (non-fast-forward rejection), RapidFire automatically syncs via `git pull --rebase` and retries the push.
* **Automatic GitHub Repo Provisioning**: If the local repository lacks a configured remote origin, RapidFire proactively detects your `gh` CLI credentials, prompts to create the GitHub repository, and sets the upstream tracking branch automatically.

### Examples
```bash
# Push directly to main from any branch
git add . push -m -commit "Add server module"

# Push all files to the current active branch
git add . push -m "Add server module"

# Push all files to a new or existing feature branch
git add . push -b branch1 -commit "new feature"

# Shorthand for main branch
git add . push -main -commit "production update"

# Push a single file with commit message
git add README.md push -m -commit "updated documentation"
```

---

## Bidirectional Terminal History & Real-Time Highlighting

RapidFire seamlessly synchronizes command history across your host operating system and active shell environment:

* **Instant Up-Arrow Recall**: When you launch RapidFire, pressing Up Arrow immediately cycles through commands previously executed in your normal terminal.
* **Session Persistence**: When you exit RapidFire, all commands executed during your session are automatically saved back to your host shell's history file.
* **Cross-Platform Host Support**:
  * **Windows**: PowerShell PSReadLine (`ConsoleHost_history.txt`)
  * **macOS**: Zsh (`~/.zsh_history`)
  * **Linux**: Bash (`~/.bash_history`), PowerShell (`pwsh`)
  * **RapidFire Dedicated Store**: Persistent fallback in `~/.rapidfire/history.txt`
* **Real-Time Keystroke Highlighting**: Commands, subcommands, flags, and strings highlight on every character insertion without delay, styled after PowerShell PSReadLine themes.

---

## Command Reference

| Command | Category | Description |
|---|---|---|
| `help` | General | Display the interactive command manual |
| `init` / `setup <recipe> <folder>` | Scaffolding | Scaffold any of the 13 full-stack projects or initialize RapidFire |
| `explain [path]` | AI Analysis | Explains codebase architecture, folder tree, or source file role |
| `ask <question>` | AI Companion | Technical Q&A with conversational memory & 1-click package installer |
| `ask clear` | AI Companion | Clear conversation context memory |
| `suggest <description>` | AI Companion | Recommends optimal architecture with interactive `(Y/N)` scaffold prompt |
| `tell <instruction>` | AI Generation | Generates code and files with plan preview & `(Y/N)` safety approval |
| `key <api-key>` | Configuration | Save or change your AI API key (auto-detects provider) |
| `key status` | Configuration | Display active AI provider, model, masked key, and source |
| `key clear` | Configuration | Remove stored AI credentials |
| `save preset <name> [folder]` | Presets | Serialize project files & manifest into `~/.rapidfire/presets/<name>.json` |
| `load preset <name> <folder>` | Presets | Recreate project structure & files from a saved preset |
| `presets` | Presets | List all saved workspace presets |
| `deploy vercel` | Deployment | Deploy frontend to Vercel production with manual confirmation |
| `git add <files> push [-b <branch>|-m] -commit "<msg>"` | Git Automation | Stage specific files or `.`, commit, and push in one unified command (supports `-m` for main, `-b` for branch, and auto-sync) |
| `exit` / `quit` | Session | Exit RapidFire cleanly |
| *any shell command* | PTY Shell | Native passthrough (`cd`, `ls`, `git`, `npm`, `python`, `docker`) |

---

## Testing & Verification

RapidFire maintains a rigorous automated testing suite covering all 13 framework recipes, shell passthrough, AI fallbacks, cross-platform paths, and security scanners:

```bash
npm test
```

```text
======================================================
Summary: 24 passed, 0 failed (24 total)
======================================================
ALL 24 TEST SUITES PASSED FLAWLESSLY!
```

---

## License

MIT © Vedansh Shrivastava ([@Debunkem](https://github.com/Debunkem))
