# RAPIDFIRE CLI: The Complete A-Z Project Master Guide

> **Official Project Documentation & Technical Overview**  
> **Project Name:** RapidFire CLI  
> **Repository:** [https://github.com/VsrCube/Rapidfire-Cli](https://github.com/VsrCube/Rapidfire-Cli)  
> **Version:** v0.1.21 (Major Architecture Upgrade: Dynamic Scaffolding & Multi-Provider AI)  
> **Authors:**  
> • **Vedansh Shrivastava** (Roll No: 321)  
> • **Vaishnavi Sahu** (Roll No: 319)  
> • **Tanwi Gupta** (Roll No: 311)  
> • **Tanmay Mittal** (Roll No: 309)  
> **Project Guide / Supervisor:** **Ms. Ruchika**, Assistant Professor, Department of Computer Science & Engineering  
> **Institution:** Greater Noida Institute of Technology (GNIOT), Greater Noida  
> **Affiliation:** Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow  
> **Academic Session:** B.Tech CSE (Batch: 2025–2029, 2nd Year / 3rd Semester)  

---

## Quick Navigation / Table of Contents
1. [Executive Summary: What is RapidFire?](#1-executive-summary-what-is-rapidfire)
2. [The Core Problems RapidFire Solves](#2-the-core-problems-rapidfire-solves)
3. [System Architecture: How It Works Under the Hood](#3-system-architecture-how-it-works-under-the-hood)
4. [The 3-Tier Dynamic Scaffolding Engine](#4-the-3-tier-dynamic-scaffolding-engine)
5. [DevSecOps Security Engine: The In-Flight Secret Shield](#5-devsecops-security-engine-the-in-flight-secret-shield)
6. [Unified Git & GitHub Automation Layer](#6-unified-git--github-automation-layer)
7. [Multi-Provider AI Intelligence Engine](#7-multi-provider-ai-intelligence-engine)
8. [Workspace Presets & Deterministic Snapshot Engine](#8-workspace-presets--deterministic-snapshot-engine)
9. [Complete CLI Command Reference Manual](#9-complete-cli-command-reference-manual)
10. [Codebase Map: File-by-File Directory Guide](#10-codebase-map-file-by-file-directory-guide)
11. [How to Setup, Run & Demo (Step-by-Step)](#11-how-to-setup-run--demo-step-by-step)
12. [Faculty Defense & Viva Cheatsheet (20 Comprehensive Q&As)](#12-faculty-defense--viva-cheatsheet-20-comprehensive-qas)

---

## 1. Executive Summary: What is RapidFire?

**RapidFire CLI** is a **Terminal Overlay, Shell Passthrough REPL, and Unified Developer Environment**. It transforms any standard operating system terminal into an intelligent, secure, and automated development console.

### The Big Picture
Instead of opening multiple terminals, navigating web browsers for documentation, manually setting up virtual environments, debugging CORS errors, and hoping you didn't accidentally commit an API key to GitHub, **RapidFire unifies the entire engineering cycle directly inside your terminal session.**

```
+----------------------------------------------------------------------------------------------------+
|                                    RAPIDFIRE UNIFIED TERMINAL REPL                                 |
|                                                                                                    |
|  [Persistent Shell PTY] <---> [3-Tier Scaffolder] <---> [Gitleaks Shield] <---> [Multi-Provider AI] |
|                                                                                                    |
|  Zero-Latency Shell          13 Recipes + Dynamic       Pre-Push Secret Blocking    Groq / OpenAI  |
|  Passthrough (<2ms)          Unknown Frameworks         Before Cloud Push           Gemini Free    |
+----------------------------------------------------------------------------------------------------+
```

### The 4 Pillars of RapidFire:
1. **Zero Context Switching**: A persistent terminal session that acts as your standard shell (`bash`, `zsh`, `powershell`), while running RapidFire commands alongside regular commands (`ls`, `cd`, `git`, `docker`, `vim`).
2. **Local-First & Privacy-Focused**: Runs 100% on your machine. No telemetry, no tracking, and zero cloud lock-in.
3. **Shift-Left Security by Default**: Intercepts code *before* it leaves your machine. Gitleaks pre-push hooks block secret leaks in-flight.
4. **Dynamic Fullstack Orchestration**: Scaffolds both built-in recipes and completely unknown, user-specified frameworks with automatic CORS, port bindings, and manifests.

---

## 2. The Core Problems RapidFire Solves

In modern software development, setting up and maintaining a project is fraught with friction:

### Problem 1: Terminal & Toolchain Fragmentation
* **The Struggle**: A full-stack developer running React + FastAPI needs `npx create-vite`, `python3 -m venv`, `pip install`, `uvicorn`, `git init`, and `gh repo create`.
* **RapidFire Solution**: One single command—`setup react+fastapi myapp`—sets up the frontend, backend, CORS, virtual environment, git repository, and security hooks in seconds.

### Problem 2: "CORS Hell" & Port Collisions
* **The Struggle**: Developers spend hours diagnosing `Error 403 / CORS Request Blocked` because the frontend (`localhost:3000`) cannot reach the backend (`localhost:8000`).
* **RapidFire Solution**: RapidFire pre-configures `CORSMiddleware` in FastAPI/Django/Express/Flask and guarantees distinct, non-colliding port allocations on first boot.

### Problem 3: The Public Secret Leak Epidemic
* **The Struggle**: Over 10 million secrets (AWS keys, GitHub tokens, OpenAI keys) are accidentally committed to public repositories every year (Meli et al., NDSS 2019). Scanners on GitHub Actions catch leaks *after* they are pushed—when bots have already scraped them.
* **RapidFire Solution**: The `push` command executes an **in-flight local Gitleaks scan**. If an API key is detected in staged or unstaged diffs, the push is immediately blocked locally.

### Problem 4: Hardcoded Recipe Rigidity
* **The Struggle**: Standard CLI scaffolding tools are rigid. If a tool doesn't have an exact recipe for a framework (like `astro`, `solid`, `nestjs`, or `svelte+fastapi`), it gives up with an error.
* **RapidFire Solution**: RapidFire features a **3-Tier Dynamic Scaffolding Engine** that can intelligently compose unlisted pairings and dynamically scaffold entirely unknown frameworks via AI blueprints.

---

## 3. System Architecture: How It Works Under the Hood

RapidFire is built in **Node.js** with native C++ bindings for low-level operating system pseudo-terminal management. It bridges developer commands, native PTY execution, dynamic scaffolding, secret scanning, and automated Git workflows into a cohesive pipeline.

### Master Architecture Diagram

```mermaid
graph TD
    User["Developer in Terminal"] --> REPL["Terminal Overlay REPL (src/repl.js)"]
    
    subgraph Core ["RapidFire Terminal Overlay Layer"]
        REPL --> PTY["PTY Bridge (node-pty)<br/>Raw ANSI stream &lt;2ms<br/>SIGWINCH Resize Handling"]
        REPL --> Lexer["Command Lexer & Dispatcher (src/commands/index.js)"]
        REPL --> SynHL["Real-time Syntax Highlighter & Autocompletion"]
        REPL --> Hist["Bidirectional Shell History Sync"]
    end
    
    PTY --> OS["Host Operating System Shell<br/>(bash / zsh / powershell / cmd)"]
    
    Lexer -->|setup| ScaffoldingEngine["3-Tier Scaffolding Engine (src/commands/setup.js)"]
    Lexer -->|push| GitEngine["Unified Git & Security Engine (src/commands/push.js)"]
    Lexer -->|ask / suggest / tell / explain| AIEngine["Multi-Provider AI Engine (src/ai/provider.js)"]
    Lexer -->|preset| PresetEngine["Smart Presets & Manifests (src/commands/preset.js)"]
    Lexer -->|deploy| DeployEngine["Vercel Cloud Deployments (src/commands/deploy.js)"]

    subgraph Scaffolding ["3-Tier Scaffolding Subsystem"]
        ScaffoldingEngine --> StackPlanner["Stack Planner (planner.js)"]
        StackPlanner -->|Tier 1: Predefined| Predefined["13 Predefined Stacks (Offline Templates)"]
        StackPlanner -->|Tier 2: Composed| Composed["Arbitrary Pairings (e.g. svelte+fastapi)"]
        StackPlanner -->|Tier 3: Dynamic| DynamicEngine["Dynamic AI Engine (dynamicEngine.js)"]
        DynamicEngine --> SchemaValidator["Schema-Validated Blueprint Generation"]
        DynamicEngine --> PathSanitizer["Path Traversal Sanitizer & Preview Gate"]
    end

    subgraph GitSubsystem ["Intelligent Git Lifecycle Subsystem"]
        ScaffoldingEngine --> ParentCheck{"Inside Parent Git Repo?<br/>(getParentGitRepo)"}
        ParentCheck -->|Yes| SkipNested["Skip Nested .git Init<br/>(Prevents Broken Submodules)"]
        ParentCheck -->|No| PromptLocal{"Prompt: Init Local Git?<br/>(Y/N)"}
        PromptLocal -->|Yes| InitGit["git init -b main<br/>+ Gitleaks Pre-Push Hook"]
        PromptLocal -->|No| SkipLocal["Skip Git (Zero .git created)"]
        
        InitGit --> GhPrompt{"Prompt: Create Remote GitHub?<br/>(Y/N)"}
        GhPrompt -->|Yes| GhCreate["gh repo create --source=. --push"]
        GhPrompt -->|No| SkipGh["Skip Remote Creation"]

        GitEngine --> PushGitCheck{"Inside Git Repo?"}
        PushGitCheck -->|No| PushPrompt{"Prompt: Init Git Now?<br/>(Y/N)"}
        PushPrompt -->|No| AbortPush["Abort Push Cleanly"]
        PushPrompt -->|Yes| InitGitPush["git init -b main & Hook"]
        PushGitCheck -->|Yes| GitleaksScan["Gitleaks In-Flight Secret Scan"]
        InitGitPush --> GitleaksScan
        GitleaksScan -->|Leak Detected| BlockPush["BLOCK PUSH IN-FLIGHT"]
        GitleaksScan -->|Clean| StageAndPush["Stage (git add .) -> Commit -> Push to Origin"]
    end

    subgraph SecuritySubsystem ["DevSecOps Security Guardrails"]
        GitleaksScan
        PathSanitizer
        DepAudit["Interactive Package Injection Guard"]
        PrereqCheck["Runtime Pre-flight LTS & Tool Checker"]
    end
```

### End-to-End System Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant REPL as RapidFire REPL
    participant Router as Command Router
    participant Engine as Scaffolding / Git Engine
    participant Security as Gitleaks & Security Layer
    participant Host as OS Shell / Git / Cloud

    Dev->>REPL: Types command (e.g. setup, push, ask)
    REPL->>Router: Parse tokens and match verb
    alt Host Shell Command (e.g. ls, git, docker)
        Router->>Host: Stream to node-pty (<2ms latency)
        Host-->>Dev: Raw ANSI output stream
    else Scaffolding Command (setup <stack> <folder>)
        Router->>Engine: planStack(stack) -> Tier 1, 2, or 3
        Engine->>Host: Detect parent Git repository
        alt Inside Parent Git Repo
            Engine-->>Dev: [rapidfire] Detected parent repo. Skipping nested git init.
        else Outside Git Repo
            Engine->>Dev: Prompt: Initialize local Git repository? (Y/N)
        end
        Engine->>Host: Write scaffolded files, .rapidfire.json, .gitignore
        Engine->>Security: Install Gitleaks pre-push hook (.git/hooks/pre-push)
        Engine-->>Dev: Green project ready banner & next steps
    else Unified Push Command (push -m "msg")
        Router->>Engine: parsePushArgs()
        Engine->>Host: Check if inside Git worktree
        alt Not in Git Repo
            Engine->>Dev: Prompt: Initialize new Git repository now? (Y/N)
            alt User enters 'n'
                Engine-->>Dev: Abort: working directory is not a Git repository.
            else User enters 'y'
                Engine->>Host: git init -b main & install hook
            end
        end
        Engine->>Security: In-flight local Gitleaks scan
        alt Secret Detected
            Security-->>Dev: PUSH BLOCKED: Secret / API Key Detected!
        else Clean
            Engine->>Host: git add . && git commit -m "msg" && git push
            Host-->>Dev: Successfully pushed to origin/branch!
        end
    end
```

### Architectural Subsystem Breakdown:

```
                           +----------------------------------------+
                           |        Developer Input in REPL         |
                           +----------------------------------------+
                                                |
                                                v
                           +----------------------------------------+
                           |      Command Lexer & Dispatcher        |
                           +----------------------------------------+
                                         /            \
                       Is RapidFire Verb?              Is Host Shell Command?
                              /                              \
                             v                                v
               +---------------------------+    +-----------------------------+
               | RapidFire Internal Engine |    |   node-pty Pseudo-Terminal  |
               | • Scaffolding (setup)     |    |   • /bin/bash / /bin/zsh    |
               | • Security Shield (push)  |    |   • PowerShell / cmd.exe    |
               | • Multi-Provider AI (ask) |    |   • Raw ANSI stream (&lt;2ms)  |
               | • Presets & Deployment    |    |   • SIGWINCH Resize Handling|
               +---------------------------+    +-----------------------------+
                             \                               /
                              \                             /
                               v                           v
                           +----------------------------------------+
                           |       Unified Terminal Feedback        |
                           +----------------------------------------+
```

### Stage 1: The REPL & Readline Layer (`src/repl.js`)
* Uses Node.js `readline` with custom keystroke hooks for real-time syntax highlighting.
* Pre-loads host shell history (`~/.bash_history`, `~/.zsh_history`, PowerShell PSReadLine history) so your terminal history is preserved.
* Provides custom tab completion via `createCompleter()`.

### Stage 2: The `node-pty` Pseudo-Terminal Bridge (`src/shell.js`)
* If a command is not a RapidFire verb (e.g. `ls -la`, `cd ..`, `cat file.txt`, `npm test`, `git status`), it is forwarded directly to the child PTY.
* Uses native OS APIs (`forkpty(3)` on Linux/macOS, `ConPTY` on Windows).
* **Latency < 2ms**: Streams raw binary buffers directly without overhead.
* **Full Terminal Fidelity**: Supports curses-based interactive programs (e.g. `vim`, `nano`, `htop`, interactive prompts) and handles terminal window resize events (`SIGWINCH`) automatically.

---

## 4. The 3-Tier Dynamic Scaffolding Engine

RapidFire does not limit developers to hardcoded templates. Its scaffolding subsystem ([planner.js](file:///home/vedansh/Desktop/miniproject/src/scaffolding/planner.js), [dynamicEngine.js](file:///home/vedansh/Desktop/miniproject/src/scaffolding/dynamicEngine.js)) operates across **three progressive tiers**:

```
[setup <stack> <folder>]
         |
         +--> Tier 1: Built-in Predefined Recipes (13 exact matches)
         |            • Instant, offline, embedded fallbacks
         |
         +--> Tier 2: Dynamic Composed Pairings (e.g., svelte+fastapi, vue+flask)
         |            • Combines modular frontend & backend adapters
         |            • Wires CORS, ports, and manifests automatically
         |
         +--> Tier 3: Dynamic Unknown Frameworks (e.g., astro, solid, nextjs, nestjs)
                      • Generates structured blueprint via AI / ecosystem starters
                      • Displays terminal file preview & requires explicit [Y/N] approval
                      • Injects .rapidfire.json (generationMode: "dynamic") + Gitleaks
```

### Tier 1: The 13 Built-in Predefined Recipes
These recipes are baked directly into the CLI with clean local fallbacks, meaning they work 100% offline:
* **Connected Fullstacks**:
  1. `setup react+fastapi <folder>`: React (Vite) + FastAPI (Async Python) with CORS
  2. `setup react+django <folder>`: React (Vite) + Django REST Framework with SQLite
  3. `setup react+node <folder>`: React (Vite) + Express.js Node backend
  4. `setup react+flask <folder>`: React (Vite) + Flask Python backend
  5. `setup vue+fastapi <folder>`: Vue 3 (Vite) + FastAPI backend
  6. `setup vue+node <folder>`: Vue 3 (Vite) + Express.js backend
  7. `setup vue+django <folder>`: Vue 3 (Vite) + Django REST backend
  8. `setup svelte+node <folder>`: Svelte (Vite) + Express.js backend
* **Standalone Frontends**:
  9. `setup react <folder>`: Standalone React (Vite) project
  10. `setup vue <folder>`: Standalone Vue 3 (Vite) project
  11. `setup svelte <folder>`: Standalone Svelte (Vite) project
* **Standalone Backends**:
  12. `setup fastapi <folder>`: Standalone FastAPI backend with Uvicorn
  13. `setup django <folder>`: Standalone Django backend with virtual environment support

### Tier 2: Dynamic Composed Pairings (Unlisted Combinations)
If a user specifies a pairing like `setup svelte+fastapi myapp` or `setup vue+flask myapp`:
* RapidFire's `StackPlanner` detects that both `svelte` and `fastapi` exist as modular adapters in `src/scaffolding/adapters/`.
* It automatically creates the directory structure, configures CORS origins, assigns independent ports (`3000` for frontend, `8000` for backend), initializes Git, and records `generationMode: "composed"` in `.rapidfire.json`.

### Tier 3: Unknown Frameworks & Arbitrary Stacks
If a user specifies an unlisted framework (e.g., `setup astro myapp`, `setup solid myapp`, `setup nextjs myapp`, or `setup nestjs myapp`):
1. **Interactive Detection**: RapidFire detects that the stack is unlisted and prompts:
   ```text
   [rapidfire] Recipe 'astro' is not in the predefined catalogue.
   Would you like to dynamically scaffold this project now? (Y/N): 
   ```
2. **AI Blueprint Generation**: RapidFire queries its active AI engine (Gemini, Groq, or OpenAI) to generate a complete, working project blueprint (package configurations, entry points, scripts, stylesheets).
3. **Path Traversal Security**: Every file path is sanitized to ensure no files escape the target project directory.
4. **Interactive Confirmation Gate**: The terminal displays a complete preview of the proposed files and line counts. **No files are written until the user confirms `(Y/N)`**.
5. **Standard Guardrails**: Upon approval, RapidFire writes the files, generates `.rapidfire.json` (`generationMode: "dynamic"`), initializes Git, and installs the Gitleaks pre-push hook.

---

## 5. DevSecOps Security Engine: The In-Flight Secret Shield

RapidFire shifts security **all the way to the left**:

```
+----------------------------------------------------------------------------------------------------+
|                                    IN-FLIGHT SECRET GUARDRAIL                                      |
|                                                                                                    |
|  [Developer types: push]  --->  [Local Gitleaks Hook]  --->  {Clean?} --- YES ---> [GitHub Remote] |
|                                                                  |                                 |
|                                                                  NO                                |
|                                                                  v                                 |
|                                                      [BLOCKED IN-FLIGHT LOCALLY]                   |
|                                                      Zero packets leave machine                    |
+----------------------------------------------------------------------------------------------------+
```

### Why Local Pre-Push Beating Cloud CI/CD:
* Cloud scanners (like GitHub Actions) scan code *after* it has been pushed.
* Malicious scraping bots monitor the public GitHub commit stream via the GitHub Events API and harvest credentials in **under 60 seconds**. Once pushed, the token is compromised even if you delete the commit immediately.
* **RapidFire executes the scan locally** before any network connection is opened.

### How It Works:
1. When a project is scaffolded, RapidFire writes an automated pre-push hook into `.git/hooks/pre-push`.
2. When the user runs `push` or `git push`, Gitleaks audits all staged and unstaged commits.
3. Over **160+ token rules** are evaluated:
   * AWS Access Key IDs & Secret Access Keys
   * GitHub Personal Access Tokens (`ghp_...`)
   * OpenAI / Anthropic / Groq API Keys (`sk-...`, `gsk_...`)
   * Google Gemini / Cloud API Keys (`AIza...`)
   * Private RSA / SSH / PGP keys
4. If a secret is detected:
   * The push transaction is **immediately aborted**.
   * The exact filename, line number, and rule signature are printed in high-contrast red warning text.
   * Zero bytes leave your host machine.

---

## 6. Unified Git & GitHub Automation Layer

RapidFire simplifies daily Git workflows into a single, high-productivity command: `push`.

### Features of the `push` Command:
1. **Intelligent Staging & Committing**:
   ```bash
   push -m "feat: added authentication middleware"
   ```
   Automatically stages all modified files (`git add .`), writes the commit message, and pushes to origin.
2. **Compound Syntax Flexibility**:
   Supports natural developer syntax:
   * `git add . push -branch main -commit "initial release"`
   * `git add src/app.js push -m "fix bug"`
   * `add . push -m "quick update"`
3. **Automated Remote Repository Creation via GitHub CLI (`gh`)**:
   * If a project has no remote GitHub repository attached, RapidFire checks if the GitHub CLI is installed and authenticated.
   * It prompts: `Do you want to create a remote GitHub repository for '<project>'? (Y/N)`.
   * If approved, it calls `gh repo create <project> --source=. --remote=origin --push` automatically, saving 5 manual steps.

### Intelligent Git Lifecycle & Nested Git Prevention

A common bug in traditional scaffolding tools occurs when a developer scaffolds a frontend and a backend separately inside the same root workspace. Blindly executing `git init` inside `frontend/` and `backend/` creates **nested `.git` repositories**, which git flags as broken submodules or untracked directories.

RapidFire solves this with an **Intelligent Git Lifecycle Engine** ([gitContext.js](file:///home/vedansh/Desktop/miniproject/src/utils/gitContext.js)):

1. **Parent Git Repository Detection (Nested Git Guard)**:
   * Before running `git init`, RapidFire inspects the parent directory tree via `git rev-parse --show-toplevel`.
   * If the target directory is already inside an existing Git repository, RapidFire prints:
     `[rapidfire] Detected parent Git repository at '<parentRepo>'. Skipping nested git init.`
   * Zero nested `.git` folders are created. Both `<frontend>` and `<backend>` are tracked seamlessly by the parent repository.
2. **On-Demand Local Git Initialization**:
   * For standalone projects outside any repository, RapidFire does not blindly force a `.git` folder.
   * It asks the developer: `Do you want to initialize a local Git repository for '<folder>'? (Y/N): `
   * If **No (`N`)**: zero `.git` is created, and the remote GitHub prompt is skipped.
   * If **Yes (`Y`)**: initializes `main` branch and installs the Gitleaks pre-push hook.
3. **On-Demand Push Initialization**:
   * If a developer runs `push` inside a directory that is not yet a Git repository, RapidFire prompts:
     `No Git repository found in current directory. Would you like to initialize one now? (Y/N): `
   * If the user selects **Y**, it initializes the repo, installs the hook, and completes the push.
   * If the user selects **N**, it aborts the push cleanly with zero disk modifications.

---

## 7. Multi-Provider AI Intelligence Engine

RapidFire integrates an AI assistant directly inside the terminal session (`src/ai/provider.js`).

### Supported Providers:
* **Google Gemini** (Gemini 1.5 Flash / 2.0 Flash) — includes automatic fallback with Gemini Free Tier.
* **Groq Cloud** (Llama 3.3 70B Versatile, Llama 3.1 8B) — sub-second ultra-fast inference.
* **OpenAI** (GPT-4o, GPT-4o-mini).

### Provider Configuration (`key` Command):
```bash
# Save or switch API key (RapidFire auto-detects provider by key prefix)
key gsk_xxxxxxxxxxxxxxxxxxxxxx   # Auto-detects Groq
key sk-xxxxxxxxxxxxxxxxxxxxxxx   # Auto-detects OpenAI
key AIzaxxxxxxxxxxxxxxxxxxxxxx   # Auto-detects Gemini

# Inspect active provider status
key status

# Override active model
key model llama-3.3-70b-versatile

# Clear credentials
key clear
```

### AI Commands in the Terminal:
1. **`ask <question>`**: Interactive technical Q&A with conversational memory.
   * If the question involves missing packages, RapidFire presents a **1-click interactive dependency installer**.
2. **`suggest <description>`**: Analyzes project requirements and recommends an optimal full-stack architecture with an interactive `(Y/N)` prompt to scaffold it immediately.
3. **`tell <instruction>`**: Generates code files from natural language instructions (e.g. `tell create a python log parser and unit test`). Displays a file preview and requires confirmation.
4. **`explain [file|folder]`**: Deep architectural inspection of source code files or directory structures.
5. **`ask clear`**: Clears multi-turn conversational context memory.

### Safety Guardrails:
All AI-suggested commands are passed through a strict regex sanitizer. Destructive commands (`rm -rf`, `sudo`, `dd`, `mkfs`, fork bombs) are stripped and rejected. Commands are never run without interactive user approval.

---

## 8. Workspace Presets & Deterministic Snapshot Engine

RapidFire solves the problem of "works on my machine" across different developer setups:

```bash
# Save your current project configuration as a reusable preset
save preset my-dashboard myapp

# List all available presets stored in ~/.rapidfire/presets/
presets

# Restore and rehydrate the exact project structure on any machine
load preset my-dashboard new-project
```

### What a Preset Stores:
Presets are serialized into JSON schemas (`~/.rapidfire/presets/<name>.json`) containing:
* Directory layout and file templates
* Pinned package dependencies (`package.json`, `requirements.txt`)
* Environment variable templates (`.env.example` with values sanitized for security)
* Custom build and startup scripts
* Associated framework metadata

---

## 9. Complete CLI Command Reference Manual

| Command Category | Command Syntax | Description & Examples |
| :--- | :--- | :--- |
| **Shell REPL** | `rapidfire` | Launch the persistent fullscreen terminal overlay REPL. |
| **Built-in Scaffolding** | `setup <recipe> <folder>` | Scaffold one of 13 built-in fullstack or standalone projects.<br>• `setup react+fastapi myapp`<br>• `setup react+django myapp`<br>• `setup vue+node myapp`<br>• `setup react myfrontend` |
| **Composed Scaffolding** | `setup <fe>+<be> <folder>` | Dynamically compose unlisted pairings.<br>• `setup svelte+fastapi myapp`<br>• `setup vue+flask myapp` |
| **Dynamic Scaffolding** | `setup <unknown> <folder>` | Dynamically scaffold any unlisted framework via AI blueprints.<br>• `setup astro myapp`<br>• `setup solid myapp`<br>• `setup nextjs myapp` |
| **Git & DevSecOps** | `push -m "commit message"` | Audit staged diffs for secrets via Gitleaks, commit, and push. |
| | `git add . push -branch <br> -commit "msg"` | Flexible multi-token syntax for custom branches and staging. |
| **AI Assistance** | `ask <question>` | Ask programming questions with conversational context & 1-click dep installer. |
| | `ask clear` | Clear conversation context memory. |
| | `suggest <idea>` | Recommend stack architecture with prompt to scaffold immediately. |
| | `tell <instruction>` | Generate code files from plain English instructions with preview gate. |
| | `explain [file\|folder]` | Analyze codebase architecture, directory tree, or source file role. |
| **AI Configuration** | `key <api-key>` | Save or update API key (auto-detects Groq, OpenAI, Gemini). |
| | `key status` | Display active provider, model, masked key, and config status. |
| | `key model <model-name>` | Override active LLM model. |
| | `key clear` | Remove stored API credentials. |
| **Presets** | `save preset <name> [folder]` | Save current project tree into a reusable JSON blueprint. |
| | `load preset <name> <folder>` | Restore project files and dependencies from a saved preset. |
| | `presets` / `list presets` | List all saved presets on the host machine. |
| **Help & Exit** | `help` | Display the full built-in interactive manual. |
| | `exit` / `quit` | Exit the RapidFire REPL session back to the host shell. |

---

## 10. Codebase Map: File-by-File Directory Guide

The RapidFire codebase is organized into modular layers:

```
rapidfire-cli/
├── bin/
│   └── rapidfire.js                  # CLI executable entrypoint (shebang #!/usr/bin/env node)
├── src/
│   ├── ai/
│   │   ├── gemini.js                 # Bridge adapter for AI helpers
│   │   └── provider.js               # Multi-provider AI engine (Gemini, Groq, OpenAI)
│   ├── commands/
│   │   ├── index.js                  # Master command lexer, token matcher & router
│   │   ├── setup.js                  # Scaffolding command handler (3-tier dispatch)
│   │   ├── push.js                   # Git push engine with Gitleaks pre-push inspection
│   │   ├── ask.js                    # Interactive AI Q&A with dep installer
│   │   ├── suggest.js                # Architecture recommender with Y/N scaffolding
│   │   ├── tell.js                   # Code generation engine with file preview
│   │   ├── explain.js                # Code & directory architecture explainer
│   │   ├── key.js                    # API key and provider configuration manager
│   │   ├── preset.js                 # Workspace preset serialization & restoration
│   │   ├── deploy.js                 # Vercel deployment helper
│   │   └── help.js                   # Visual manual & documentation printer
│   ├── scaffolding/
│   │   ├── planner.js                # 3-tier stack planner (Predefined, Composed, Dynamic)
│   │   ├── dynamicEngine.js          # Dynamic unknown framework scaffolding engine
│   │   └── adapters/
│   │       ├── frontend.js           # Reusable adapters for React, Vue 3, Svelte
│   │       └── backend.js            # Reusable adapters for FastAPI, Express, Django, Flask
│   ├── integrations/
│   │   ├── gitleaks.js               # Local Gitleaks binary detector & hook installer
│   │   ├── gh.js                     # GitHub CLI (`gh`) status & repo creation
│   │   └── vercel.js                 # Vercel CLI deployment integration
│   ├── utils/
│   │   ├── gitContext.js             # Parent Git detection & on-demand interactive init prompts
│   │   ├── proc.js                   # Process execution helpers, venv & prerequisite checks
│   │   ├── manifest.js               # .rapidfire.json manifest reader & writer
│   │   ├── highlighter.js            # Real-time ANSI syntax highlighter & tab completer
│   │   ├── history.js                # Host shell history importer (~/.bash_history, etc.)
│   │   ├── fsHelpers.js              # Filesystem utilities
│   │   ├── configPath.js             # Cross-platform ~/.rapidfire configuration store
│   │   └── depInstaller.js           # Regex-validated 1-click dependency installer
│   ├── repl.js                       # Interactive REPL session & keystroke interceptor
│   └── shell.js                      # Persistent PTY shell bridge via node-pty
├── test/                             # 26 Automated Test Suites
│   ├── test_all.js                   # Master verification runner (26 suites passing)
│   ├── test_nested_git.js            # Validates nested Git prevention & on-demand lifecycle
│   ├── test_dynamic_scaffolding.js   # Validates Tier 1, 2, and 3 scaffolding
│   ├── test_setup_recipe.js          # Tests built-in scaffolding recipes
│   ├── test_push_command.js          # Tests Git push & Gitleaks secret interception
│   ├── test_pty_passthrough.js       # Tests terminal stream latency & signals
│   └── ...                           # Additional integration & unit tests
├── package.json                      # Project metadata & npm dependencies
└── PROJECT_OVERVIEW_A_TO_Z.md        # This master documentation file
```

---

## 11. How to Setup, Run & Demo (Step-by-Step)

Share these exact steps with friends or teammates to run and demo RapidFire on their machines:

### Prerequisites
* **Node.js**: v18.0.0 or higher (LTS recommended)
* **npm**: v9.0.0 or higher
* **Python**: 3.9+ (required for FastAPI, Django, or Flask recipes)
* **Git**: Installed and configured (`git config --global user.name ...`)

### Step 1: Clone and Install
```bash
# Clone the repository
git clone https://github.com/VsrCube/Rapidfire-Cli.git
cd Rapidfire-Cli

# Install dependencies (installs node-pty, fs-extra, etc.)
npm install
```

### Step 2: Launch the RapidFire REPL
```bash
# Start the REPL directly
npm start

# OR link globally so you can run 'rapidfire' from any terminal
npm link
rapidfire
```

### Step 3: Run the Live Presentation Demo (5 Killer Commands)

Show this sequence to examiners or friends during a live demonstration:

1. **Demonstrate Native Shell Passthrough**:
   Inside RapidFire, run any standard shell command to prove zero-latency passthrough:
   ```bash
   ls -la
   pwd
   git status
   ```
2. **Demonstrate Built-in Fullstack Scaffolding**:
   Scaffold a React + FastAPI fullstack project with automated CORS in 5 seconds:
   ```bash
   setup react+fastapi demo_app
   ```
3. **Demonstrate Dynamic Unknown Framework Scaffolding**:
   Show off the new major feature—scaffold an unlisted framework (e.g. Astro):
   ```bash
   setup astro my_astro_site
   ```
   *Watch RapidFire detect that it's unlisted, generate a clean blueprint preview, prompt for confirmation, and scaffold it!*
4. **Demonstrate DevSecOps Secret Blocking**:
   Inside any git folder, create a dummy file containing a synthetic AWS key:
   ```bash
   echo "AWS_KEY=AKIAIOSFODNN7EXAMPLE" > test_secret.env
   git add test_secret.env
   push -m "test leak"
   ```
   *Watch RapidFire intercept and abort the push locally before it ever reaches GitHub!*
5. **Demonstrate Multi-Provider AI Assistance**:
   Configure an API key and ask a technical question:
   ```bash
   key gsk_xxxxxxxxxxxxxxxx    # Or your Gemini key
   ask how do I set up JWT authentication in FastAPI?
   ```

---

## 12. Faculty Defense & Viva Cheatsheet (20 Comprehensive Q&As)

These 20 questions and answers cover every theoretical, architectural, and security question examiners or professors are likely to ask during project evaluation:

#### Q1: What is RapidFire CLI, and how does it differ from tools like Yeoman, Vite, or Docker?
> **Answer**: Docker is a container runtime that virtualizes the operating system, which is resource-heavy and does not provide scaffolding or shell overlays. Yeoman and Vite provide isolated frontend boilerplates but do not wire fullstack backends, do not configure CORS, and do not provide terminal overlays or secret security. RapidFire is a **terminal overlay and workflow synthesizer**—it unifies zero-latency PTY shell passthrough, pre-connected fullstacks (frontend + backend + database + CORS), in-flight secret scanning, and error-driven AI assistance directly inside the user's everyday terminal session.

#### Q2: What is a Pseudo-Terminal (PTY), and how does RapidFire implement it?
> **Answer**: A pseudo-terminal (PTY) is an OS kernel pair of virtual character devices (master and slave) that emulates a real hardware terminal. RapidFire uses `node-pty`, which interfaces with the operating system's native pseudo-terminal subsystem (`forkpty(3)` on Unix/POSIX systems and `ConPTY` on Windows). Unrecognized commands are streamed directly between standard I/O streams and the child PTY process without intermediate buffering, maintaining full ANSI colors, cursor control, and terminal signals (`SIGINT`, `SIGWINCH`) with under 2ms latency.

#### Q3: How does the new Dynamic Scaffolding Engine handle unknown frameworks?
> **Answer**: RapidFire uses a 3-tier `StackPlanner`:
> * **Tier 1 (Predefined)**: Executes the 13 built-in recipes with offline fallbacks.
> * **Tier 2 (Composed)**: Composes unlisted pairings of known adapters (e.g. `svelte+fastapi`), automatically wiring CORS and ports.
> * **Tier 3 (Dynamic)**: When given a completely unknown framework (e.g. `astro`, `solid`, `nextjs`), RapidFire queries its configured AI provider (Gemini, Groq, or OpenAI) to generate a structured project blueprint. It displays a terminal preview of all proposed files, requires explicit developer approval `[Y/N]`, writes files within a sanitized directory sandbox, and attaches Git and Gitleaks hooks.

#### Q4: Why is local pre-push secret scanning superior to GitHub Actions secret scanning?
> **Answer**: GitHub Actions secret scanning operates *asynchronously after code is pushed to GitHub*. Once pushed, public commits are scraped by automated bot networks in under 60 seconds (Meli et al., NDSS 2019), rendering post-commit alerts obsolete. RapidFire shifts security completely to the left: it intercepts the `push` command *locally before any network packet leaves the host machine*, scans staged and unstaged diffs against 160+ token rules via GitLeaks, and aborts the push immediately if a high-entropy secret is detected.

#### Q5: What happens under the hood if an API key is detected during `rapidfire push`?
> **Answer**: The Git push transaction is aborted immediately. RapidFire outputs a red-flag diagnostic detailing the exact file name, line number, and token signature (e.g. `AWS Access Key ID Detected`). The remote repository remains untouched, preserving the confidentiality of the credentials.

#### Q6: What is "CORS Hell", and how does RapidFire eliminate it?
> **Answer**: Cross-Origin Resource Sharing (CORS) is a browser security mechanism that blocks web pages from making HTTP requests to a different domain or port than the one that served the web page. In fullstack development, frontends typically run on port 3000 while backends run on port 8000 or 5000. RapidFire eliminates CORS errors by automatically injecting `CORSMiddleware` (with `allow_origins=["*"]` or configured frontend ports) into the generated backend source code (FastAPI, Django, Express, Flask) upon scaffolding.

#### Q7: Can RapidFire work completely offline without an internet connection?
> **Answer**: Yes. For all built-in recipes, RapidFire includes embedded zero-dependency fallback templates directly in the codebase. If `degit` or network requests fail, RapidFire automatically falls back to local generation, initializes virtual environments, and completes setup offline.

#### Q8: How does RapidFire protect users from malicious or hallucinated AI commands?
> **Answer**: RapidFire implements a strict regex command sanitizer. Before presenting any AI-recommended command to the developer, it scans the string and automatically rejects dangerous patterns such as recursive file deletion (`rm -rf`), disk formatting (`mkfs`, `dd`), privilege escalation (`sudo`), or fork bombs. Furthermore, RapidFire never auto-executes AI commands silently; it always requires explicit interactive confirmation (`[Y/N]`).

#### Q9: What multi-provider AI options does RapidFire support, and how are API keys managed?
> **Answer**: RapidFire supports Google Gemini (Gemini 1.5/2.0 Flash), Groq Cloud (Llama 3.3 70B Versatile, Llama 3.1 8B), and OpenAI (GPT-4o). API keys are configured via the `key <api-key>` command. RapidFire automatically detects the provider based on key prefixes (`gsk_` for Groq, `sk-` for OpenAI, `AIza` for Gemini) and saves credentials locally in `~/.rapidfire/config.json`.

#### Q10: How does RapidFire handle terminal resizing inside the REPL?
> **Answer**: When a terminal emulator window is resized, the operating system kernel emits a `SIGWINCH` (Window Change) signal. RapidFire listens for this signal via `process.stdout.on('resize', ...)` and propagates the updated column and row dimensions (`cols`, `rows`) directly to the underlying `node-pty` master file descriptor, preventing visual glitches or broken curses interfaces.

#### Q11: How does RapidFire handle Python virtual environments across different operating systems?
> **Answer**: RapidFire detects the host OS. On Linux and macOS, it spawns `python3 -m venv venv` and resolves the binary at `venv/bin/python`. On Windows, it creates the environment and resolves the binary at `venv\Scripts\python.exe`. It verifies virtual environment activation before attempting any `pip install` commands.

#### Q12: How are workspace presets created and restored?
> **Answer**: Running `save preset <name> [folder]` inspects the project directory and serializes its structure, dependencies, configuration files, and manifest into a JSON schema stored in `~/.rapidfire/presets/<name>.json`. Running `load preset <name> <folder>` reads the schema and deterministically re-creates the exact directory layout and files, guaranteeing zero environmental drift between team members.

#### Q13: How many automated test suites validate the codebase?
> **Answer**: RapidFire is validated by **25 automated test suites** in the `/test` directory. These suites cover PTY stream latency, scaffolding syntax across all 13 recipes, dynamic scaffolding across all 3 tiers, simulated Gitleaks secret injection, GitHub CLI authentication, and cross-platform path resolution.

#### Q14: How does RapidFire integrate with the GitHub CLI (`gh`)?
> **Answer**: During `push`, if no git remote is detected, RapidFire checks `gh auth status`. If authenticated, it automatically invokes `gh repo create <project-name> --source=. --remote=origin --push`, eliminating five separate manual terminal commands.

#### Q15: Why was Node.js chosen as the primary implementation language?
> **Answer**: Node.js provides the asynchronous, event-driven `libuv` event loop, which is ideal for multiplexing concurrent terminal streams (`stdin`, `stdout`, `stderr`, PTY streams) without blocking. Furthermore, npm is the primary package distribution platform for full-stack developers, enabling zero-friction distribution via `npm install -g rapidfire-cli`. Native C++ bindings via `node-pty` provide raw kernel-level terminal performance.

#### Q16: What is the patentability and intellectual property status of RapidFire?
> **Answer**: Under Section 3(k) of the Indian Patents Act, 1970, and 35 U.S.C. § 101 in the United States, pure software algorithms and command-line interfaces are categorized as computer-implemented processes and face high patent eligibility hurdles unless tied to novel physical hardware. RapidFire is protected under **Copyright Law** (protecting the literal source code), **Trademark Law** (protecting the "RapidFire" brand), and **Defensive Open-Source Publication** (establishing prior art under the MIT License to prevent third parties from patenting these workflows).

#### Q17: What is the `.rapidfire.json` manifest file?
> **Answer**: `.rapidfire.json` is a metadata manifest placed in the root of every scaffolded project. It tracks the project name, frontend framework, backend framework, generation mode (`predefined`, `composed`, or `dynamic`), creation timestamp, and RapidFire version, enabling preset serialization and intelligent project upgrades.

#### Q18: How does RapidFire preserve terminal history from standard shells?
> **Answer**: Upon launching the REPL, RapidFire's `history.js` inspects standard shell history paths on the host system (`~/.bash_history`, `~/.zsh_history`, and Windows PowerShell `ConsoleHost_history.txt`). It loads previous commands into the readline history buffer, allowing developers to use Up/Down arrow keys seamlessly.

#### Q19: What happens if an unknown framework has no package manager or requires compilation?
> **Answer**: RapidFire's dynamic blueprint generator specifies the project's ecosystem (`node`, `python`, `go`, `rust`, etc.) and dev commands (`npm run dev`, `go run .`, `cargo run`). It prints exact build instructions in the terminal and prompts whether to run the ecosystem's package installation command automatically.

#### Q20: What is the future roadmap for RapidFire CLI?
> **Answer**: Future milestones include:
> 1. Runtime LTS switching (`rapidfire runtime use node --lts`).
> 2. Automated Docker and Docker Compose containerization recipe generation.
> 3. WebSocket-based peer-to-peer terminal pairing for collaborative remote debugging.
> 4. Native Linux/macOS package distribution via Homebrew (`brew install rapidfire`) and Arch User Repository (AUR).

---

*Authored by Vedansh Shrivastava*  
*RapidFire CLI*
