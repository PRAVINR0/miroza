<!-- GitHub Copilot Instructions for contributors and AI coding agents -->
# Copilot / AI agent instructions for this repository

This repository currently has minimal contents. The goal of these instructions is to help an AI coding agent be immediately productive given the repo's current shape and to propose sensible next steps.

**Quick summary:**
- **Repo name:** `miroza`
- **Known files:** `README.md` (single-line placeholder)
- **Missing/expected:** no `src/`, `tests/`, `package.json`, `pyproject.toml`, or CI configuration detected.

**When you start exploring**
- **Check these paths:** look for `README.md`, `LICENSE`, `src/`, `tests/`, `.github/workflows/`, `package.json`, `pyproject.toml`, `requirements.txt`, and `setup.cfg`.
- **If you find none of the above:** assume the repository is a scaffold and ask the maintainer what language/stack they expect.

**Agent behavior / strategy (concise):**
- **Do not make destructive assumptions.** If the language or intended app type is not present, propose scaffolding rather than implementing a large feature.
- **Ask clarifying questions** before adding opinionated choices (language, framework, CI provider, test runner).
- **Prefer small, incremental PRs**: each change should have a clear purpose (e.g., "Add Python project scaffold" or "Add initial Node.js package.json").

**Suggested first tasks (ask before acting):**
- Expand `README.md` with project purpose, intended language, and expected runtime.
- Add a minimal scaffold based on the user's preferred language (examples below).
- Add a `.github/workflows/ci.yml` that runs the chosen language's test/build commands.

**Examples of minimal scaffolds (copyable suggestions)**
- Python: create `pyproject.toml`, `src/miroza/__init__.py`, `tests/test_placeholder.py`, and a GitHub Action that runs `python -m pytest`.
- Node: create `package.json`, `src/index.js`, `tests/index.test.js`, and a GitHub Action that runs `npm test`.

**Repository-specific notes discovered by inspection**
- The only existing file is `README.md` and it contains a single line (the project name). There are no build or test commands to infer.
- Because there is no language or tooling detected, any agent should confirm stack choices before initializing scaffolding.

**Conventions and PR style for this repo**
- **Commit messages:** Use concise imperative verbs and reference the high-level change, e.g. `feat: add Python scaffold` or `chore: add CI workflow`.
- **PR descriptions:** Include a short summary, listed files changed, and a recommended test recipe (how to run locally).

**When adding CI/workflows**
- Use `.github/workflows/ci.yml`. Keep the workflow minimal and clearly documented in the PR. Example steps: checkout -> set up runtime -> install deps -> run tests.

**If you cannot proceed**
- Ask the repository owner: "Which language and runtime should I scaffold for?" Provide two reasonable options (e.g., Python or Node) and the pros/cons.

**What not to do**
- Do not assume a default framework (Django/React/etc.) without explicit guidance.
- Do not delete or rename existing files without explicit approval in the issue/PR.

If anything in these instructions is unclear or you want the file tailored to a preferred language/workflow, reply with the stack choice and I will update this file and propose a first PR.
