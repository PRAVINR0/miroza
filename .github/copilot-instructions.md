```markdown
<!-- Guidance for AI coding agents working on this repository. -->

**Purpose**
- **Goal**: Help an AI coding agent become productive quickly by describing repository structure, typical workflows, and safe next steps tailored to this codebase.

**Repository Snapshot (quick)**
- This repo contains a static/site project with generated HTML at the repository root (many `.html` files), a `data/` directory of JSON source data, an `assets/` folder with CSS/JS, `scripts/` with Node and PowerShell generators, and `server.js` to serve the site.
- Key paths: `scripts/`, `data/`, `assets/`, `admin/`, `server.js`, `package.json`.

**Big picture / architecture**
- The site is data-driven: JSON files in `data/` (e.g. `articles.json`, `search-index.json`) are inputs for generator scripts in `scripts/` which emit HTML, feeds, and metadata into the repo root.
- `scripts/generate_site.js` is the main site generation entry; other scripts build metadata (`generate_meta.js`, `generate_prerender_meta.js`) and optimize assets (`optimize-images.js`).
- `server.js` is a small Express static server (default port 8080) used to preview the generated output locally.

**Where to look first (important files)**
- `package.json` — contains `scripts` (see below). Node >=16 expected.
- `scripts/generate_site.js` — main generator.
- `scripts/build.js` — bundling/minify step used by `npm run build`.
- `scripts/optimize-images.js` and `.ps1` wrappers — image optimization pipeline (uses `sharp`).
- `data/*.json` — canonical content sources (update here, then re-run generators).
- `admin/panel.html` — admin UI used to preview/manage content locally.
- `assets/js/*.js` and `service-worker.js` — client-side behaviors (search, UI wiring, offline caching).

**Common commands (PowerShell examples)**
- Install dependencies: `npm ci` or `npm install`
- Generate site and metadata: `npm run generate`  # runs `generate_site.js` + meta scripts
- Full build (minify/bundle): `npm run build`
- Serve locally (preview generated site): `npm run start`  # starts `node server.js` (http://localhost:8080)
- Optimize images: `npm run optimize-images`
- Wire UI helpers: `npm run wire-ui`
- Deploy to GitHub Pages (if authorized): `npm run deploy` (uses `gh-pages`)

When running multiple commands in PowerShell on one line, separate with `;` (example):
`npm ci; npm run generate; npm run build`

**Project-specific conventions & patterns**
- Data-first workflow: edit or add items in `data/*.json`, then re-run `npm run generate` to update HTML, feeds, and search index.
- Scripts often have PowerShell wrappers (under `scripts/`): prefer the wrapper on Windows for path/permission consistency (`*.ps1`).
- Image optimization relies on `sharp`; developing on Windows may require native dependencies — run `npm ci` and consult `sharp` docs if install fails.
- The static server `server.js` sends `index.html` as a fallback (SPA-like routing). HTML files are generated into repo root — treat that root as the published site.

**Integration points & external deps**
- `gh-pages` is used in the deploy script — deploying requires repository permissions and the target branch (commonly `gh-pages`).
- `sharp` for image transforms; `terser` and `clean-css` for asset minification.

**Editing guidance for agents (practical steps)**
1. Run `npm ci` (or `npm install`).
2. Make small changes to `data/*.json` or `assets/*` and then run `npm run generate` to confirm generated output changes.
3. Use `npm run build` for minified assets and to exercise `scripts/build.js`.
4. Run `npm run start` and open `http://localhost:8080` to preview — check `admin/panel.html` for admin UI.
5. If adding CI, keep workflows minimal: `npm ci`, `npm run generate`, optionally `npm run build` and basic lint/test steps (only if added).

**When you are blocked**
- Ask targeted questions (examples):
  - "Which branch is the site published from (e.g. `gh-pages` or `main`)?"
  - "Do you want CI that builds the site or just a deploy pipeline?"
  - "Are there credentials or environment secrets for image processing or deployment?"

**Notes & safety**
- Preserve `CNAME` unless maintainers request changes — it configures DNS for GitHub Pages.
- Do not commit or attempt to modify any credentials or secrets.

---
If you'd like, I can also:
- add a minimal `.github/workflows/ci.yml` (build + generate),
- or create a short README snippet describing local dev steps.

Please review this and tell me any missing details or preferences to include (publish branch, CI requirements, or platform constraints).

```<!-- Auto-generated guidance for AI coding agents working on this repository. -->

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
