# RAPIDFIRE CLI: All You Should Know (Master Project Manual)

> **Document Version**: 1.0.0  
> **Target Release**: RapidFire CLI v0.1.21  
> **Authors**: Vedansh Shrivastava (Roll: 321), Vaishnavi Sahu (Roll: 319), Tanwi Gupta (Roll: 311), Tanmay Mittal (Roll: 309)  
> **Supervision**: Ms. Ruchika, Assistant Professor, Department of Computer Science & Engineering  
> **Institution**: Greater Noida Institute of Technology (GNIOT), AKTU Lucknow  
> **Academic Session**: 2025–2029 (2nd Year, 3rd Semester)  
> **Repository**: [https://github.com/VsrCube/Rapidfire-Cli](https://github.com/VsrCube/Rapidfire-Cli)

---

## Table of Contents
1. [Executive Summary & Core Philosophy](#1-executive-summary--core-philosophy)
2. [The Problem Landscape: Why Modern Development is Broken](#2-the-problem-landscape-why-modern-development-is-broken)
3. [System Architecture & Data Flow Pipeline](#3-system-architecture--data-flow-pipeline)
4. [The 13 Fullstack Scaffolding Recipes Matrix](#4-the-13-fullstack-scaffolding-recipes-matrix)
5. [DevSecOps Engine & In-Flight Secret Guardrail](#5-devsecops-engine--in-flight-secret-guardrail)
6. [AI Intelligence Layer & Pluggable Providers](#6-ai-intelligence-layer--pluggable-providers)
7. [Deterministic Workspace Presets & Snapshot Engine](#7-deterministic-workspace-presets--snapshot-engine)
8. [Complete CLI Command Reference Manual](#8-complete-cli-command-reference-manual)
9. [Codebase Architecture & Directory Map](#9-codebase-architecture--directory-map)
10. [Academic Evaluation & Viva Defense Cheatsheet (15 Q&As)](#10-academic-evaluation--viva-defense-cheatsheet-15-qas)

---

## 1. Executive Summary & Core Philosophy

**RapidFire CLI** is a **Terminal Overlay, Shell Passthrough REPL, and Unified Developer Environment** engineered to eliminate cognitive friction, disjointed toolchains, and credential leaks in modern software engineering.

### The Core Philosophy: "Stay in the Flow"
1. **Zero Context Switching**: Developers spend up to 40% of their workday toggling between terminal windows, web browsers (StackOverflow, documentation), cloud dashboards, and external secret scanners. RapidFire keeps the developer entirely inside a single, high-performance terminal session.
2. **Local-First & Zero Telemetry**: RapidFire operates 100% locally on the host machine. No code, configuration, or keystrokes are transmitted to proprietary clouds.
3. **Shift-Left Security by Default**: Security is not an afterthought run in remote CI/CD pipelines; it is enforced *at the instant of typing* via automated GitLeaks pre-push interception.
4. **Deterministic Reproducibility**: Fullstack starter architectures (React, Vue, Svelte, Django, FastAPI, Express) are emitted with pre-configured ports, CORS, and virtual environments, guaranteed to work offline without network dependency.

---

## 2. The Problem Landscape: Why Modern Development is Broken

```
+----------------------------------------------------------------------------------------------------+
|                                    TRADITIONAL DEVELOPER WORKFLOW                                  |
|                                                                                                    |
|  [Terminal 1: npm]  <--->  [Terminal 2: python]  <--->  [Browser: StackOverflow]  <--->  [Cloud Git] |
|        |                          |                             |                        |         |
|  Port Collision!            Missing venv!                 CORS Error 403!          API Key LEAKED! |
+----------------------------------------------------------------------------------------------------+
```

### 1. The CLI Fragmentation Crisis
To spin up a modern fullstack project (e.g., React + FastAPI), a developer must juggle multiple disparate command-line tools: `npx create-vite`, `python3 -m venv`, `pip install`, `uvicorn`, `git init`, `gh repo create`, and external linter configs. Each tool uses different conventions, error formats, and environment requirements.

### 2. Deprecated & Bloated Scaffolding Tools
Industry staples like `create-react-app` (CRA) have been officially deprecated by the React team due to webpack bloat and slow build times. Modern alternatives (like `degit` or raw template repos) fail when offline and lack connected backend configurations.

### 3. The "Frontend-Backend Disconnect" (CORS & Port Hell)
Novice and experienced engineers frequently spend hours troubleshooting:
- **Port Collisions**: Frontend and backend both attempting to claim port `3000` or `8000`.
- **CORS Failures**: Browsers blocking cross-origin API requests because `CORSMiddleware` was not configured with allowed origins during initial project setup.
- **Environment Inconsistency**: Python packages installed globally rather than in project-isolated virtual environments (`venv`).

### 4. The Secret Leak Epidemic on Public GitHub
According to cybersecurity research (including Meli et al., NDSS 2019), over **10 million authentication tokens and API keys** are leaked into public GitHub repositories annually. Existing scanners operate *asynchronously in cloud CI pipelines* (GitHub Actions), which is too late—once pushed, a leaked token is already scraped by automated bots in under 60 seconds. RapidFire halts secret leakage **before** packets leave the host machine.

---

## 3. System Architecture & Data Flow Pipeline

The system is architected into 4 clean, sequential stages:

```
[Developer Input] ---> [RapidFire Core Router] ---> [4 Execution Pipelines] ---> [Unified Terminal Feedback]
                                  |
                        [node-pty Bridge]
                                  |
                         [Native Host Shell]
```

### Stage 1: Developer Input Layer
- **Interactive REPL**: Fullscreen terminal session initiated via `rapidfire`.
- **Keystroke Interception**: Captures live characters, tab completions, history traversal (Up/Down arrows), and hotkeys (`?` for help, `!` for shell escape, `ESC` to cancel).
- **Supported Host Shells**:
  - Linux: GNU Bash (`/bin/bash`), Zsh (`/bin/zsh`)
  - macOS: Zsh (`/bin/zsh`), Bash
  - Windows: PowerShell (`powershell.exe`), Command Prompt (`cmd.exe`)

### Stage 2: RapidFire Core Router & PTY Demultiplexer
1. **Command Lexer & Parser**: Analyzes user input. If the input matches a registered RapidFire verb (`setup`, `push`, `ask`, `suggest`, `preset`, `key`, `tell`, `explain`), it dispatches to the internal asynchronous execution engines.
2. **`node-pty` Pseudo-Terminal Bridge**:
   - If the command is unrecognized (e.g., `ls -la`, `cd ..`, `cat file.txt`, `docker ps`), RapidFire forwards it directly to the underlying OS pseudo-terminal via `node-pty`.
   - **Stream Fidelity**: Raw ANSI escape codes, colored text, interactive curses/vim interfaces, and window resize events (`SIGWINCH`) pass through with **< 2ms latency**, creating the perception of a single unified terminal.

### Stage 3: The 4 Functional Execution Pipelines
- **Pipeline 1: Deterministic Scaffolding Engine (`setup <recipe>`)**: Compiles fullstack boilerplates, wires CORS, creates Python virtual environments, and injects `.rapidfire.json` + GitLeaks hooks.
- **Pipeline 2: DevSecOps Git Guardrail (`push`)**: Audits git staging, runs in-flight regex entropy checks against 160+ token rules via GitLeaks, blocks leaks, and automates remote repo creation via `gh` CLI.
- **Pipeline 3: Multi-Provider AI Assistant (`ask` / `suggest`)**: Ingests shell errors, queries Gemini / Groq / Ollama, sanitizes suggested commands, and presents a 1-click interactive `depInstaller`.
- **Pipeline 4: Deterministic Workspace Presets (`preset`)**: Serializes project trees, configuration files, and dependencies into `.rapidfire-preset.json` for instant cross-machine re-hydration.

### Stage 4: Unified Terminal Feedback
- Color-coded status badges (`[Pass] Scaffolding Completed`, `[Pass] DevSecOps Guardrail Passed`, `[Pass] AI Suggestion Prompt`, `[Pass] Deterministic State Cached`).
- Direct process exit code propagation back to the developer.

---

## 4. The 13 Fullstack Scaffolding Recipes Matrix

RapidFire features **13 pre-connected, battle-tested recipe architectures**. Every recipe is designed with:
- **Port Isolation**: Frontend defaults to port `3000`; backend defaults to port `5000` or `8000`.
- **Pre-Configured CORS**: Backend servers include pre-written CORS middleware whitelisting the frontend URL (`http://localhost:3000`).
- **Offline Fallback**: If internet connectivity is interrupted during `degit`, RapidFire falls back to internal, zero-dependency templates embedded in the CLI binary.
- **Automated Virtual Environments**: Python stacks automatically generate and configure a local virtual environment (`venv`).

| # | Recipe Command | Frontend Framework | Backend Framework | Frontend Port | Backend Port | CORS Pre-Configured? | Python venv? |
|---|---|---|---|---|---|---|---|
| 1 | `setup react` | React 18 (Vite 5) | — | 3000 | — | N/A | No |
| 2 | `setup vue` | Vue 3 (Vite 5) | — | 3000 | — | N/A | No |
| 3 | `setup svelte` | Svelte (Vite 5) | — | 3000 | — | N/A | No |
| 4 | `setup react+fastapi` | React 18 (Vite 5) | FastAPI (Python) | 3000 | 8000 | **Yes** (FastAPI CORSMiddleware) | **Yes** |
| 5 | `setup react+django` | React 18 (Vite 5) | Django REST Framework | 3000 | 8000 | **Yes** (django-cors-headers) | **Yes** |
| 6 | `setup react+node` | React 18 (Vite 5) | Express.js (Node.js) | 3000 | 5000 | **Yes** (cors middleware) | No |
| 7 | `setup vue+fastapi` | Vue 3 (Vite 5) | FastAPI (Python) | 3000 | 8000 | **Yes** (FastAPI CORSMiddleware) | **Yes** |
| 8 | `setup vue+node` | Vue 3 (Vite 5) | Express.js (Node.js) | 3000 | 5000 | **Yes** (cors middleware) | No |
| 9 | `setup vue+django` | Vue 3 (Vite 5) | Django REST Framework | 3000 | 8000 | **Yes** (django-cors-headers) | **Yes** |
| 10 | `setup react+flask` | React 18 (Vite 5) | Flask (Python) | 3000 | 5000 | **Yes** (flask-cors) | **Yes** |
| 11 | `setup svelte+node` | Svelte (Vite 5) | Express.js (Node.js) | 3000 | 5000 | **Yes** (cors middleware) | No |
| 12 | `setup fastapi` | — | FastAPI (Python) | — | 8000 | **Yes** | **Yes** |
| 13 | `setup django` | — | Django (Python) | — | 8000 | **Yes** | **Yes** |

### The 3-Tier Dynamic Scaffolding Engine
In addition to the 13 built-in recipes, RapidFire features an extensible **3-Tier Scaffolding Engine** (`src/scaffolding/planner.js`, `src/scaffolding/dynamicEngine.js`):
1. **Tier 1 (Predefined Recipes)**: Instant offline generation of the 13 foundational stacks above.
2. **Tier 2 (Composed Unlisted Pairings)**: Dynamically pairs modular frontend and backend adapters (e.g. `setup svelte+fastapi myapp` or `setup vue+flask myapp`), automatically wiring CORS middleware, port separation (3000 / 8000), and manifests with `generationMode: "composed"`.
3. **Tier 3 (Unknown Frameworks via AI Blueprints)**: When given an unlisted framework (e.g. `setup astro myapp`, `setup solid myapp`, `setup nextjs myapp`, or `setup nestjs myapp`), RapidFire detects that it is unlisted, queries its active AI engine for a structured project blueprint, previews the proposed files in the terminal, requires explicit `[Y/N]` developer confirmation, writes the files within a sanitized sandbox, and attaches Git and Gitleaks hooks with `generationMode: "dynamic"`.

### Recipe Manifest (`.rapidfire.json`)
Every scaffolded project includes a root metadata manifest:
```json
{
  "name": "my-project",
  "recipe": "react+fastapi",
  "generationMode": "predefined",
  "scaffoldedAt": "2026-10-08T18:30:00.000Z",
  "frontend": { "dir": "frontend", "port": 3000 },
  "backend": { "dir": "backend", "port": 8000, "venv": true },
  "gitLeaksProtected": true
}
```

---

## 5. DevSecOps Engine & In-Flight Secret Guardrail

```
[Developer: push] ---> [Staging Audit] ---> [GitLeaks Scanner]
                                                  |
                  +-------------------------------+-------------------------------+
                  |                                                               |
         [Secret Detected!]                                              [No Secrets Found]
                  |                                                               |
     1. Abort Git Push Immediately                                   1. Verify GitHub Auth (gh CLI)
     2. Report File, Line #, Token Type                              2. Auto-create Repo (if needed)
     3. Suggest Mitigation Command                                   3. Atomic Remote Push (git push)
```

### GitLeaks Integration Details
- **Engine**: Invokes native or bundled `gitleaks` binary via child process stream piping.
- **Rule Coverage**: Evaluates files against 160+ high-entropy regular expression signatures covering:
  - AWS Access Key IDs (`AKIA...`) and Secret Keys
  - GitHub Personal Access Tokens (`ghp_...`, `github_pat_...`)
  - OpenAI Secret Keys (`sk-...`)
  - Stripe Secret & Publishable Keys (`sk_live_...`, `rk_live_...`)
  - Google Gemini API Keys (`AIzaSy...`)
  - Slack Webhooks, Database Connection Strings (PostgreSQL, MongoDB URIs)
  - RSA/SSH Private Keys (`-----BEGIN OPENSSH PRIVATE KEY-----`)
- **Automated Hook Injection**:
  During `rapidfire setup`, RapidFire automatically generates `.git/hooks/pre-push` with executable permissions (`chmod +x`), ensuring that even if a developer uses standard `git push origin main` outside RapidFire, the secret inspection still executes!

---

## 6. AI Intelligence Layer & Pluggable Providers

RapidFire provides contextual, error-driven AI assistance without locking the developer into a proprietary cloud vendor.

### 1. Pluggable Providers
| Provider | Supported Engine | Setup Command | Ideal Use Case |
|---|---|---|---|
| **Google Gemini** | Gemini 1.5 Flash / 2.0 | `key gemini <API_KEY>` | Ultra-fast multimodal reasoning, cloud coding assistance |
| **Groq Cloud** | Llama 3 70B / Mixtral | `key groq <API_KEY>` | Sub-second LPUs (Language Processing Units), instant responses |
| **Ollama** | Local Llama 3 / CodeLlama | *Auto-detected (`localhost:11434`)* | 100% offline, zero data transmission, air-gapped environments |

### 2. Context Ingestion & Error Interception
When a command fails with exit code != 0 or when the user types `suggest`:
1. RapidFire captures the last 15 lines of `stderr` output.
2. Reads the current working directory's `package.json` or `requirements.txt`.
3. Ingests the project manifest (`.rapidfire.json`).
4. Generates an optimized prompt:
   > *"The user encountered this terminal error in a React+FastAPI project: `<stderr>`. Diagnose the cause and provide the exact fix command."*

### 3. The 1-Click `depInstaller` with Regex Guardrail
When the AI detects a missing package (e.g., `ModuleNotFoundError: No module named 'fastapi_cors'`), RapidFire:
1. Validates the command against strict regex patterns (only allowing safe package manager invocations: `npm install <pkg>`, `pip install <pkg>`).
2. Rejects destructive strings (blocking `rm -rf`, `sudo`, `dd`, `chmod 777`).
3. Prompts the user:
   ```text
   [rapidfire-ai] Detected missing dependency: fastapi-cors
   Press [Y] to install via pip now, or [N] to ignore: _
   ```
4. If the user presses `Y`, RapidFire executes the installation in the active virtual environment automatically!

---

## 7. Deterministic Workspace Presets & Snapshot Engine

### The Problem: "It Works on My Machine"
Team members frequently spend days synchronizing environmental configurations, port settings, dotenv variables, and directory scaffolds.

### The RapidFire Solution: `.rapidfire-preset.json`
- **`preset save <name>`**:
  - Traverses the active project directory tree.
  - Serializes file structures, package manifests, and sanitized environment variables.
  - Saves the template into `~/.rapidfire/presets/<name>.json`.
- **`preset load <name>`**:
  - Unpacks the snapshot in seconds into a clean folder.
  - Recreates directory hierarchies, installs pinned dependencies, and guarantees zero drift across team workstations.
- **`presets` / `list presets`**:
  - Displays all locally saved and built-in workspace templates with creation timestamps and framework tags.

---

## 8. Complete CLI Command Reference Manual

### Core Shell Operations
- `rapidfire`: Launches the fullscreen interactive REPL session with shell passthrough.
- `init`: Displays active RapidFire status and quick-start instructions.
- `help`: Opens the complete interactive help manual with supported recipe names and options.
- `exit` / `quit`: Gracefully terminates the RapidFire session and returns to the host shell.

### Scaffolding & Setup
- `setup <recipe> <folder>`:
  - Scaffolds specified architecture.
  - Example: `setup react+fastapi my-saas-app`
  - Example: `setup vue+node client-server`
- `setup <recipe>`: Scaffolds inside the current directory if empty.

### DevSecOps & Git Synchronization
- `push -m "<message>"`: Runs GitLeaks scan, stages files, commits with `<message>`, and pushes to remote.
- `push -b <branch>`: Pushes to a specific target branch (defaults to active branch or `main`).
- `push --private`: Instructs GitHub CLI (`gh`) to create a private repository if one does not exist.
- `git add . push -m "<message>"`: Flexible natural language alias matching developer muscle memory.

### AI Assistance & Diagnostics
- `ask <question>`: Queries the active AI provider with terminal context.
  - Example: `ask why is my django port 8000 already in use?`
- `suggest`: Analyzes the most recent terminal failure and provides a remediation command.
- `tell <instruction>`: Executes guided task assistance.
- `explain <command>`: Explains complex Unix or Windows commands before execution.
  - Example: `explain find . -name "*.log" -delete`

### Configuration & Providers
- `key <provider> <token>`: Persists API key locally in `~/.rapidfire/config.json`.
  - Example: `key gemini AIzaSy...`
  - Example: `key groq gsk_...`
- `deploy <target>`: Automates production deployment (supports Vercel CLI).

### Preset State Management
- `preset save <name>`: Takes a snapshot of current project configuration.
- `preset load <name>`: Restores a saved snapshot into current directory.
- `presets` or `list presets`: Lists all saved presets.

---

## 9. Codebase Architecture & Directory Map

```text
miniproject/
├── bin/
│   └── rapidfire.js            # CLI Entrypoint; initializes REPL or one-shot flags
├── src/
│   ├── repl.js                 # Interactive REPL overlay, hotkey listener, cursor sync
│   ├── shell.js                # node-pty child process spawner, stream piping
│   ├── commands/
│   │   ├── index.js            # Command lexer, parser, and fuzzy suggestion engine
│   │   ├── setup.js            # 13 Recipe scaffolding templates and venv provisions
│   │   ├── push.js             # Atomic git push, GitLeaks integration, gh repo link
│   │   ├── ask.js              # Natural language prompt generator with terminal context
│   │   ├── suggest.js          # stderr error diagnosis and 1-click depInstaller prompt
│   │   ├── preset.js           # Deterministic workspace preset serializer & unpacker
│   │   ├── key.js              # API key manager (Gemini, Groq)
│   │   ├── deploy.js           # Deployment integration (Vercel CLI)
│   │   ├── explain.js          # Terminal command explainer
│   │   ├── tell.js             # Task-guided AI operator
│   │   └── help.js             # ANSI-formatted interactive reference manual
│   ├── ai/
│   │   ├── provider.js         # Pluggable LLM factory (Gemini, Groq, Ollama)
│   │   ├── gemini.js           # Google Generative AI SDK client wrapper
│   │   ├── groq.js             # Groq Cloud API REST client wrapper
│   │   └── ollama.js           # Local Ollama daemon REST client wrapper
│   ├── scaffolding/
│   │   ├── planner.js          # 3-tier stack planner (Predefined, Composed, Dynamic)
│   │   ├── dynamicEngine.js    # Dynamic unknown framework scaffolding engine
│   │   └── adapters/
│   │       ├── frontend.js     # Reusable adapters for React, Vue 3, Svelte
│   │       └── backend.js      # Reusable adapters for FastAPI, Express, Django, Flask
│   ├── integrations/
│   │   ├── gitleaks.js         # GitLeaks process runner, 160+ rule scanner, hook injector
│   │   ├── gh.js               # GitHub CLI wrapper (gh repo create, auth status)
│   │   └── vercel.js           # Vercel deployment automation wrapper
│   └── utils/
│       ├── proc.js             # Cross-platform process execution, venv generation
│       ├── manifest.js         # .rapidfire.json schema reader/writer
│       ├── fsHelpers.js        # Recursive directory copy, clean removal, file audit
│       ├── configPath.js       # ~/.rapidfire cross-platform configuration store
│       └── depInstaller.js     # Regex-validated 1-click package installer
├── test/                       # 25 Automated Test Suites
│   ├── test_all.js             # Master test harness runner
│   ├── test_dynamic_scaffolding.js # Validates 3-tier dynamic scaffolding
│   ├── test_setup_recipe.js    # Validates all 13 recipe builds & file structures
│   ├── test_push_command.js    # Simulates secret leak blocking and git pushing
│   ├── test_pty_passthrough.js # Verifies stream latency and exit code propagation
│   └── ...                     # Additional unit & integration tests
├── flowchart_and_pipeline.svg  # High-resolution architectural vector diagram
├── flowchart_and_pipeline.png  # 300 DPI publication-grade raster diagram
├── flowchart_and_pipeline.html # Responsive interactive browser preview
├── sysnpsis.docx               # Academic project synopsis (10 pages)
└── sysnpsis.pdf                # Headless compiled PDF (10 pages verified)
```

---

## 10. Academic Evaluation & Viva Defense Cheatsheet (15 Q&As)

These 15 questions and answers are designed to prepare the student team for faculty review, project defense panels, and external examiners:

#### Q1: What makes RapidFire unique compared to existing tools like Docker, Yeoman, or Vite?
> **Answer**: Docker manages containerized runtime virtualization, which is heavy and introduces virtualization overhead. Yeoman and Vite provide isolated frontend boilerplates but do not wire fullstack backends, do not configure CORS, and do not provide terminal overlays. RapidFire is a **terminal overlay and workflow synthesizer**—it combines zero-latency PTY shell passthrough, pre-connected fullstacks (frontend + backend + database + CORS), in-flight secret scanning, and error-driven AI assistance directly inside the user's everyday terminal session.

#### Q2: How does RapidFire achieve "zero-latency" shell passthrough without interfering with standard Linux/Windows commands?
> **Answer**: RapidFire uses `node-pty`, which interfaces with the operating system's native pseudo-terminal subsystem (`forkpty(3)` on Unix/POSIX and `ConPTY` on Windows). When an unrecognized command is typed, RapidFire streams raw bytes directly between standard I/O streams and the child PTY process without intermediate buffering or parsing. This yields a transmission delay under 2 milliseconds, maintaining full ANSI color fidelity, cursor control, and terminal signals (`SIGINT`, `SIGWINCH`).

#### Q3: How does the DevSecOps secret scanner operate, and why is it superior to GitHub Actions secret scanning?
> **Answer**: GitHub Actions secret scanning operates *asynchronously after code is pushed to GitHub*. Once pushed, public commits are scraped by malicious threat actors in under 60 seconds, rendering post-commit alerts obsolete. RapidFire shifts security entirely to the left: it intercepts the `push` command *locally before any network packet leaves the host*, scans unstaged and staged git diffs against 160+ token rules via GitLeaks, and aborts the push immediately if a high-entropy secret is detected.

#### Q4: What happens if an API key is detected during `rapidfire push`?
> **Answer**: RapidFire instantly aborts the git push transaction. It outputs a red-flag diagnostic detailing the exact file name, line number, and token signature (e.g., `AWS Access Key ID Detected`). The remote repository remains untouched, preserving the confidentiality of the developer's credentials.

#### Q5: Why are fullstack recipes like `react+fastapi` pre-configured, and what specific problem does this solve?
> **Answer**: Beginners and teams frequently encounter "CORS Hell" and port conflicts when connecting independent frontend and backend servers. RapidFire guarantees that the frontend is assigned port `3000`, the backend is assigned port `8000`, and the backend server's code automatically imports and initializes Cross-Origin Resource Sharing (`CORSMiddleware`) allowing `http://localhost:3000`. This eliminates configuration errors and enables instant end-to-end communication on first boot.

#### Q6: Can RapidFire work in offline environments without internet access?
> **Answer**: Yes. While RapidFire attempts to download the latest community templates via `degit` when online, it contains embedded, zero-dependency fallback templates directly within the codebase for all 13 stacks. If the network is unavailable, RapidFire seamlessly activates these fallback templates, initializes virtual environments, and completes the setup offline. Furthermore, local LLMs like Ollama function completely without an internet connection.

#### Q7: How does the AI layer prevent malicious or destructive commands from executing?
> **Answer**: RapidFire enforces strict regex sanitization on all suggested commands before presenting them to the developer. It specifically checks for package manager patterns (`npm install`, `pip install`, `pnpm add`). Destructive patterns—such as recursive file deletion (`rm -rf`), disk partitioning (`dd`, `mkfs`), privilege escalation (`sudo`), or fork bombs—are stripped and rejected. Furthermore, RapidFire never auto-executes AI commands silently; it requires explicit interactive confirmation (`[Y/n]`).

#### Q8: Why did you choose Node.js for the CLI rather than Go, Rust, or Python?
> **Answer**: Node.js provides the asynchronous, event-driven libuv event loop, which is ideal for multiplexing concurrent terminal streams (`stdin`, `stdout`, `stderr`, PTY streams). Furthermore, the npm registry is the primary package distribution platform for frontend and fullstack engineers, enabling zero-friction distribution via `npm install -g rapidfire-cli`. Native C++ bindings via `node-pty` provide raw kernel-level terminal performance.

#### Q9: What is the patentability status of RapidFire under intellectual property law?
> **Answer**: In accordance with Section 3(k) of the Indian Patents Act, 1970, and 35 U.S.C. § 101 in the United States, pure software algorithms and command-line interfaces are categorized as computer-implemented processes and face high patent eligibility hurdles unless tied to novel physical hardware. Therefore, RapidFire is protected under **Copyright Law** (automatic protection of literal source code), **Trademark Law** (protecting the "RapidFire" brand), and **Defensive Open-Source Publication** (establishing prior art under the MIT License to prevent third parties from patenting these workflows).

#### Q10: How does the preset management system work, and what is stored in a preset?
> **Answer**: Presets serialize project blueprints into portable JSON files (`.rapidfire-preset.json`). The preset captures directory layouts, environment keys (with secret values sanitized), pinned package dependencies, and custom build scripts. Running `preset load <name>` reads this schema and deterministically rehydrates the exact workspace configuration, ensuring zero environmental drift across different machines.

#### Q11: How do you handle terminal resizing when running inside the RapidFire REPL?
> **Answer**: When a terminal emulator window is resized, the operating system issues a `SIGWINCH` (Window Change) signal. RapidFire listens for this signal via `process.stdout.on('resize', ...)` and instantly propagates the new column and row dimensions (`cols`, `rows`) to the underlying `node-pty` master file descriptor, preventing text distortion or broken curses layouts.

#### Q12: How are Python virtual environments managed across different operating systems?
> **Answer**: RapidFire detects the host operating system. On Linux and macOS, it spawns `python3 -m venv venv` and resolves the binary at `venv/bin/python`. On Windows, it creates the environment and resolves the binary at `venv\Scripts\python.exe`. It automatically verifies virtual environment activation before attempting any `pip install` commands.

#### Q13: How many automated test suites validate RapidFire's reliability?
> **Answer**: The codebase is validated by **24 automated test suites** located in `/test`. These suites cover pseudo-terminal stream piping, scaffolding syntax across all 13 recipes, simulated GitLeaks secret injection (using synthetic dummy keys to verify blocking), GitHub CLI authentication, and cross-platform path resolution.

#### Q14: How does RapidFire handle GitHub repository synchronization if the developer does not have a remote repo created yet?
> **Answer**: RapidFire integrates with the official GitHub CLI (`gh`). During `rapidfire push`, if no git remote is detected, RapidFire checks `gh auth status`. If authenticated, it automatically invokes `gh repo create <project-name> --source=. --remote=origin` and pushes the initial commit, eliminating 5 manual terminal commands.

#### Q15: What are the future milestones planned for RapidFire CLI?
> **Answer**: The roadmap includes: (1) Local Docker containerization recipe generation; (2) WebSocket-based peer-to-peer terminal pairing for collaborative remote debugging; (3) AST-based code refactoring engine; and (4) Linux package distribution via Homebrew (`brew install rapidfire`) and Arch User Repository (AUR).

---

*End of Master Project Manual • RapidFire CLI Academic Project 2026*
