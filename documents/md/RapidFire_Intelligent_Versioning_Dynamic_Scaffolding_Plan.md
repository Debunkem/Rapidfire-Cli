# RapidFire CLI — Major Upgrade 1
## Runtime LTS Switching, Intelligent Dependency Resolution & Dynamic Scaffolding

**Status:** Design and implementation plan — not an assertion that these features already exist  
**Priority:** First major engineering upgrade, before RAG  
**Project:** RapidFire CLI  
**Reference baseline:** `all_you_should_know.md` (RapidFire v0.1.21 project manual)  
**Last revised:** 9 October 2026

---

## 1. Problem and target outcome

RapidFire currently documents **13 predefined recipes** such as `react+django`, `react+fastapi`, and `vue+node`. Several recipes name fixed React 18 / Vite 5 versions. An underlying runtime or framework moving to a newer supported release should **not require modifying RapidFire's source or publishing a new RapidFire package just to update a version number**.

**We need to solve two distinct problems:**

1. **Version currency and LTS switching.** A user must be able to discover, select, install (or switch to) an appropriate LTS runtime and refresh framework/package selections through RapidFire commands. Both the *selected runtime* and the *generated project's dependencies* matter. Updating a registry snapshot alone does not switch the user's installed Node.js or Python.
2. **Unknown stack combinations.** If `setup svelte+fastapi app` is absent from the predefined recipes, RapidFire should attempt an approved, validated composition of known framework adapters instead of immediately returning “unsupported recipe”. Eventually the same machinery may help with frameworks with no built-in adapter, but this is a separate, higher-risk tier.

**Non-goals for v1:** automatic silent upgrades of existing projects; universal support for any framework; unrestricted AI-generated shell execution; perfect package compatibility guarantees; making RAG a prerequisite.

## 2. Key technical distinction: LTS vs stable

An **LTS policy is not universal**. Node.js and Django publish explicit support/lifecycle policies; React, Vite and many npm packages generally require a stable-release and compatibility policy instead. Python's security-support lifecycle is also different from Node's Active/Maintenance LTS labels.

Version policy classes:

| Class | Selection rule | Example |
|---|---|---|
| `lts` | Prefer newest supported LTS line compatible with the stack; do not assume every ecosystem has LTS | Node.js, Django |
| `stable` | Prefer latest non-prerelease compatible release | React, Vite, many packages |
| `compatible` | Solve runtime requirements and dependency / peer-dependency intersections | `vite` + plugin + Node.js |
| `pinned` | Preserve a recorded exact version for reproducible installations | Generated project lockfiles |

**Default policy: `supported`.** Prefer supported LTS runtimes, stable frameworks, and the newest compatible patch/minor releases permitted by project policy. Do **not** chase a new major automatically in an existing project.

Never hardcode “Node 24” or “React 19” as the permanent target. Resolve release metadata at command time or from a clearly dated offline cache.

## 3. CLI commands — proposed public interface

All commands below are **proposed and must be implemented**. Existing command parsing must be examined before choosing the final exact syntax.

### Inspect and manage release selections

```bash
rapidfire versions status
rapidfire versions list node
rapidfire versions list django
rapidfire versions check --stack react+django
rapidfire versions refresh
rapidfire versions policy supported
rapidfire versions policy lts
```

- `versions status`: show selected runtime, installed runtime, source/cached date of support metadata, current stack policy and any mismatch.
- `versions list <runtime-or-framework>`: show known releases and their lifecycle status with source and query date.
- `versions refresh`: fetch updated metadata, validate it and atomically update RapidFire's local version catalogue. **Does not itself install a runtime or change an existing project.**
- `versions policy ...`: save a preferred default policy for future scaffolds, not retroactively mutate lockfiles.

### Actually install/switch the runtime LTS

```bash
rapidfire runtime use node --lts
rapidfire runtime use node --lts --install
rapidfire runtime use node --version 24.XX.Y --install
rapidfire runtime use python --supported --install
```

**Important:** These commands are not interchangeable with `versions refresh`.

Runtime-switching implementation must detect the host OS, current runtime manager (e.g. `nvm`, `fnm`, `volta`, `mise`, `pyenv`), user permissions and shell integration. **Use an already-installed supported manager where possible**; do not silently overwrite global system installations. If a compatible manager is missing, display supported alternatives and request explicit consent before installing anything. For shells where switching the *parent* process PATH is not possible, explain the required shell hook/restart or emit a shell integration command. Verify the active executable and version after switching.

Use an *exact, registry-resolved release* for the actual installation. `24.XX.Y` above is illustrative placeholder syntax, not a real version.

### Create or update a project

```bash
rapidfire setup react+django myapp --policy supported
rapidfire setup svelte+fastapi myapp --resolve dynamic
rapidfire setup nextjs+nestjs myapp --resolve experimental --dry-run
rapidfire project versions check
rapidfire project versions upgrade --dry-run
rapidfire project versions upgrade --apply
```

- **New project**: select supported compatible versions, display a plan, obtain approval, scaffold, install and validate, then pin resolved versions.
- **Existing project**: checking is read-only; upgrade is preview-first, backups/version control are checked, a compatible upgrade plan is shown, and changes require explicit approval.
- `--dry-run` must be strictly non-mutating, including no dependency installation, Git modifications or remote calls other than release-metadata retrieval.
- `--offline` (future option) uses the most recent verified cache; print its timestamp and avoid saying a version is the latest.

## 4. VersionResolver architecture

```text
RapidFire command parser
        |
        +--> VersionResolver
        |       +--> Release-source adapters (Node schedule / npm / PyPI / framework policies)
        |       +--> Validated local metadata cache + expiry
        |       +--> Lifecycle classifier (LTS / supported / stable / prerelease / EOL)
        |       +--> Compatibility constraint solver
        |       +--> Runtime manager adapter (nvm/fnm/volta/mise/pyenv etc.)
        |       +--> Version plan + user confirmation
        |
        +--> StackPlanner
                +--> Known recipe registry
                +--> Frontend / backend / database adapters
                +--> Integration contracts (ports, CORS, env, scripts)
                +--> Optional AI planner for uncovered integration glue
                +--> File preview + approval
                +--> Scaffold in temporary directory
                +--> Install / build / smoke-test
                +--> Publish or rollback
```

### Metadata sources and correctness rules

- Prefer machine-readable **official release metadata** and registries over asking an LLM what the latest version is.
- npm: package versions, dist-tags, `engines`, `peerDependencies`, deprecations; use semver range intersection rather than blindly `latest`.
- PyPI: distribution versions, `Requires-Python`, wheel compatibility and yanked releases; validate package requirements in a disposable environment. PyPI metadata alone is not a full dependency solver.
- Runtime/framework lifecycle: official Node.js release metadata and each framework's published support policy; record source URL, fetch time and any signature/hash where provided.
- Ignore prereleases by default, distinguish deprecated and end-of-life packages, and handle release API timeouts/rate limits.
- Maintain a **trusted local snapshot**. If metadata cannot be refreshed, show its age. Do not guess support status.
- Run the target package manager's actual dependency resolution in an isolated target directory/virtual environment; the planner is a precheck, not a replacement for npm/pip.

### Resolution outcome states

`RESOLVED`, `RESOLVED_WITH_WARNINGS`, `NEEDS_USER_CHOICE`, `UNSUPPORTED`, `OFFLINE_CACHE_STALE`, `FAILED_VALIDATION`.

For conflicts, report *why* and offer compatible alternatives. Never silently force an incompatible version with `--force`, `--legacy-peer-deps` or similarly unsafe bypasses.

## 5. Dynamic scaffolding — three capability tiers

**Tier A — existing deterministic recipes (keep them).** The 13 documented recipes continue working, but version numbers come from the resolver and templates must be audited for compatibility with modern majors.

**Tier B — new combinations of supported adapters (first deliverable).** Example: `svelte+fastapi`, absent from the documented recipe matrix. Compose independent Svelte and FastAPI generators; choose compatible runtimes; wire API base URL, CORS, port assignments, local development scripts, Python venv, `.rapidfire.json`, Gitleaks hook and validation commands. **Do not simply concatenate two folders and call the result complete.**

**Tier C — previously unknown frameworks (experimental follow-up).** Example: `nextjs+nestjs` if no adapters exist. Query curated documentation/official framework CLIs, build a machine-readable plan, ask the user to approve every dependency and external command, generate into an isolated temporary directory and validate the result. If a safe path cannot be found, ask for a template or stop. A generic LLM response is not trusted executable code.

### Structured project blueprint (illustrative)

```json
{
  "schemaVersion": 1,
  "name": "example-app",
  "frontend": {"framework": "svelte", "versionPolicy": "stable", "port": 3000},
  "backend": {"framework": "fastapi", "versionPolicy": "stable", "port": 8000},
  "runtimes": {"node": {"policy": "lts"}, "python": {"policy": "supported"}},
  "integration": {"apiBaseUrl": "/api", "cors": "local-dev-origin"},
  "security": {"gitleaksPrePush": true},
  "validation": ["install", "build", "backend-import", "http-smoke"]
}
```

The blueprint is an input to validation, **not permission to execute arbitrary commands**. Production-ready output should include resolved exact versions, source metadata and checksums where practical. Do not store API keys in the blueprint.

## 6. User workflow: first supported-but-unlisted combination

```text
> rapidfire setup svelte+fastapi demo --resolve dynamic

[x] Stack parsed: Svelte frontend + FastAPI backend
[x] Version metadata fetched (sources and timestamp displayed)
[x] Node LTS + compatible Python runtime selected
[x] Compatible package set resolved
[x] CORS, ports, manifests and scripts planned

Planned changes: 23 files (example only)
External dependencies: npm / pip packages listed
Commands: install, build, backend import and local HTTP smoke test
Proceed? [y/N]

[After explicit approval]
[x] Files generated in temporary workspace
[x] Dependencies installed
[x] Tests passed
[x] Project moved to ./demo
[x] Exact versions and lockfiles recorded
```

The output is **an example of the desired future experience**, not a measurement or proof that the current implementation behaves this way.

## 7. New project manifest and lock handling

Extend the existing `.rapidfire.json` while preserving compatibility with the documented structure:

```json
{
  "schemaVersion": 2,
  "name": "demo",
  "recipe": "svelte+fastapi",
  "generationMode": "composed",
  "versionPolicy": "supported",
  "resolvedVersions": {
    "node": "<actual resolved exact version>",
    "python": "<actual resolved exact version>",
    "svelte": "<actual resolved exact version>",
    "fastapi": "<actual resolved exact version>"
  },
  "resolutionMetadata": {
    "resolvedAt": "<ISO timestamp>",
    "sources": ["<trusted source URLs>"],
    "cacheUsed": false
  }
}
```

Keep `package-lock.json` or the selected package manager's lockfile, plus a pinned Python dependency lock/requirements file. Treat `.rapidfire.json` as descriptive metadata, not a substitute for a dependency lockfile. Use schema migration/versioning when reading older manifests.

## 8. Files/modules to add (proposed; paths may change after code audit)

```text
src/
  commands/
    versions.js                # versions status/list/refresh/policy
    runtime.js                 # runtime use ...
    projectVersions.js         # project check/upgrade
  versioning/
    resolver.js                # main selection API
    lifecycle.js               # support classifications
    sources/
      node.js                  # official release lifecycle
      npm.js                   # package metadata
      pypi.js                  # Python package metadata
      django.js                # official support policy
    cache.js                   # validated atomic cache, TTL
    constraints.js             # compatibility checks
    runtimeManagers.js        # per-platform manager adapters
  scaffolding/
    registry.js                # known recipes and adapter discovery
    planner.js                 # blueprint composer
    adapters/
      react.js
      vue.js
      svelte.js
      fastapi.js
      django.js
      express.js
    integrators/
      cors.js
      ports.js
      scripts.js
    validator.js               # staged build/tests and rollback
  utils/
    projectManifest.js         # versioned metadata migration
```

Update the existing `src/commands/setup.js`, router, `help.js`, CLI entrypoint and test harness **rather than duplicating their responsibilities**. The filenames above are architectural suggestions based on the supplied project manual, not confirmed source-code paths in a checked-out repository.

## 9. Implementation milestones and acceptance criteria

| Order | Deliverable | Minimum acceptance criteria |
|---|---|---|
| 0 | Audit current CLI | Confirm parser, `setup.js` templates, runtime detection and existing tests against actual source |
| 1 | Read-only version discovery | `versions status/list/refresh` return verifiable source, timestamps, lifecycle and compatibility warnings |
| 2 | Explicit runtime switching | `runtime use node --lts --install` switches through a supported manager with confirmation; checks effective runtime; detects shell/session limitations |
| 3 | Existing recipe version resolution | All 13 original recipes still build using policy-resolved versions; lockfiles and manifests record exact versions |
| 4 | Dynamic composition | Unlisted `svelte+fastapi` generates, installs, builds and passes HTTP/CORS smoke tests on supported OSes |
| 5 | Safe existing-project upgrades | Dry-run diff, approved upgrades, lockfile refresh, test run and rollback on failure |
| 6 | Experimental arbitrary frameworks | Explicit opt-in, trusted documentation, sandbox, bounded retries and clear unsupported failure mode |

### Required tests

- Simulate a new Node LTS release with fixture metadata: `versions refresh` changes the **catalogue** without code changes; `runtime use` subsequently changes the **active runtime** after approval.
- Offline and stale-cache tests: accurately report cache age; don't invent current versions.
- Missing manager / no permission / shell PATH / Windows PowerShell, Linux Bash, macOS Zsh tests.
- npm peer-dependency conflict and Python `Requires-Python` conflict tests.
- Ensure every original recipe retains supported behaviour and existing tests remain passing.
- Compose Svelte + FastAPI, check CORS origin, frontend-to-backend fetch, package installation, and built artifacts.
- Simulate install or build failure: no half-generated target directory, restore state and explain failure.
- Attempt unsafe package scripts, destructive commands and exposed secrets: require approval/block according to security policy; never bypass Gitleaks.
- Verify `--dry-run` makes **zero workspace changes**.
- Upgrade a generated project twice: lockfile and manifest remain consistent; no unapproved dependency drift.

## 10. Security and robustness requirements

- Treat registry data, release notes, retrieved docs and model output as **untrusted input**. Do not execute instructions found inside those sources.
- Allowlist official package managers and approved framework CLIs; never run arbitrary suggested shell strings without review.
- Display dependency download destinations and proposed lifecycle scripts; run installs in an isolated workspace with least privilege where feasible.
- Require explicit approval before creating files, installing/upgrading runtimes, installing dependencies, writing shell profiles or changing an existing project.
- Preserve Gitleaks pre-push checks; never embed cloud AI keys in generated files or upload sensitive files as AI context.
- Keep stable rollback/cleanup on failure, timeouts and bounded retry limits.
- Make telemetry off by default in keeping with the documented local-first design; network requests for package metadata and optional model APIs must be disclosed.

## 11. How to measure success

Track reproducible engineering evidence, not marketing guarantees:

- Latest supported runtime detected *without a RapidFire package update*.
- Runtime-switch command actually selects the intended executable in a supported shell.
- Original 13 recipes remain functional (regression suite).
- An unlisted but adapter-supported stack builds successfully.
- Dependency resolution failures have actionable explanations and don't damage existing projects.
- New project versions remain pinned and reproduce from lockfiles.
- The solution works across targeted operating systems tested in CI.

## 12. Open design decisions

1. **Runtime manager strategy:** Integrate installed `nvm`/`fnm`/`mise`/etc. first, or choose one preferred manager per OS? A universal switcher must account for Windows and parent-shell environment limitations.
2. **Version support policy:** For `--policy lts`, is Active LTS always preferred over Maintenance LTS? Recommended: Active LTS for new projects, with an explicit maintenance choice when necessary.
3. **Python compatibility:** Which Python interpreter managers and minimum supported runtimes should RapidFire test?
4. **Registry trust:** Which package registries, mirrors, timeouts and cache TTL are acceptable?
5. **Framework adapters:** Which first missing combination is the test target? Recommended: Svelte + FastAPI.
6. **AI fallback:** Is it allowed to generate only integration glue, or new framework adapters as well? Recommended: limit v1 to known adapters.

## 13. Next concrete coding step

**Request/check out the actual RapidFire source**, especially `package.json`, `bin/rapidfire.js`, `src/commands/index.js`, `src/commands/setup.js`, recipe/template files and current tests. Then implement **read-only version discovery** first, followed by **an explicit runtime-switch command**. Only after these are verified should the resolver drive the 13 recipes and the dynamic composer.

**Success criterion for Major Upgrade 1:** A user can update the local release catalogue and switch to the currently supported runtime LTS *using RapidFire commands*, then create a **new** compatible project from either a built-in recipe or a supported but previously unlisted framework combination, without editing RapidFire's version constants.

---

### Basis and limitations

This plan uses the supplied `all_you_should_know.md` for the 13 recipes, command categories, existing manifest, AI integration and proposed codebase layout. It is a **design specification**, not a completed code audit or claim of current implementation. Release numbers are intentionally not hardcoded because they change. The actual command syntax and module paths should be finalised after inspecting the repository.
