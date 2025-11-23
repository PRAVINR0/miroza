# backup/old_unused

This folder contains automation, build scripts, and older files moved from the repository root
on 2025-11-23 as part of a conservative refactor and cleanup. Files here were preserved to
avoid destructive edits and to make it easy to restore automation later.

Files moved/copied on 2025-11-23:
- `service-worker.moved-2025-11-23.js` — backup of the original root `service-worker.js` (full caching SW)
- `generate-site.yml` — backup of the GitHub Actions workflow that generated site metadata
- `package.json`, `server.js`, `sw.js`, and `scripts/` (previously present)

How to restore an item
1. Review the file in this directory.
2. Move it back to its original location (e.g., `.github/workflows/generate-site.yml`),
   then verify and re-enable only after careful review.

Notes
- These files were moved to reduce risk of accidental automated publishing or aggressive
  service-worker caching while the site is being refactored.
