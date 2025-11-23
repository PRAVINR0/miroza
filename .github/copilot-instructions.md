<!-- Auto-generated guidance for AI coding agents working on this repository. -->

**Purpose**
- **Goal**: Help an AI coding agent become productive quickly in this repository by describing discovered structure, likely workflows, and safe next steps.

**Repository Snapshot (discovered)**
- **Files found**: `CNAME` at repository root. No source code, build files (`package.json`, `pyproject.toml`, `Dockerfile`), or CI workflow files were present in the scanned tree.
- **Implication**: This repository currently looks like a small site config (a `CNAME` typically used for GitHub Pages) or an incomplete import. Before making substantive changes, confirm where the source code lives.

**Big Picture / What to look for**
- Search for these locations to infer architecture and workflows: `src/`, `app/`, `backend/`, `frontend/`, `services/`, `pkg/`, `server/`, `web/`.
- Check for these files to determine language and build system: `package.json`, `yarn.lock`, `pnpm-lock.yaml` (Node); `pyproject.toml`, `requirements.txt` (Python); `go.mod` (Go); `Cargo.toml` (Rust); `pom.xml` (Java); `Makefile`.
- Look under `.github/workflows/` for CI steps and common commands the project uses in PR checks.

**Project-specific findings & guidance**
- `CNAME` present: treat this repository as publishing a site (GitHub Pages). Before modifying DNS or site config, ask the maintainers which branch is served (commonly `gh-pages` or `main`) and any required DNS constraints.
- No tests or build scripts were discovered. If you intend to add features, first request the canonical build/test commands from the maintainer or add minimal CI that documents expected commands.

**Agent workflow rules (practical steps to follow)**
- **Start**: Run a repository scan for the files listed above. If only `CNAME` exists, ask: “Where is the application source? Is this repo a website placeholder?”
- **Confirm language/build**: Open `package.json`, `pyproject.toml`, `go.mod`, or similar to extract `scripts` and build/test commands.
- **When changing files**: Create a feature branch named `ai/<short-description>` (e.g., `ai/add-ci-workflow`). Push the branch and open a PR against `main` with a brief description and the commands to validate your change.
- **CI and tests**: If no CI exists and you add one, keep the workflow minimal and explicitly list the commands used to verify changes. Example for Node: `npm ci; npm test`.

**Patterns and conventions to preserve or confirm**
- Branching: follow the repo convention if it exists; otherwise use `ai/<task>` for AI-created branches.
- Commits/PRs: keep commit messages imperative, and include a short rationale and testing steps in the PR body.

**Integration & external dependencies**
- Because `CNAME` is present, this repo may integrate with GitHub Pages — verify DNS ownership before changing the file.
- Look for references to external services (e.g., cloud providers, registries) in config files or CI; if found, do not attempt to modify credentials—ask the maintainers.

**When you are blocked or uncertain**
- Ask targeted questions instead of guessing. Useful questions:
  - “Is this repository intended to host a website via GitHub Pages? Which branch is published?”
  - “Where is the application source code? Is it in a different repo or a submodule?”
  - “What are the canonical build and test commands?”

**Example checklist for small changes**
- Verify the repository root for `package.json`/`pyproject.toml`/`Makefile`.
- If adding CI: create `.github/workflows/ci.yml` with minimal steps and explain how to run them locally.
- If altering `CNAME`: confirm target domain and publish branch with maintainers.

**Final note**
- This repository currently lacks discoverable source or CI config. Before implementing feature work, ask for the location of the application code or permission to scaffold minimal CI/build files. After you confirm, update this guidance with concrete commands and file references.

---
If any section is unclear or you can point me to where the app code lives, I will update and expand these instructions with concrete build/test commands and code examples from the repository.
