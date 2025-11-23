# Miroza — Site Tools

This repository contains a static site for Miroza and helper tooling to automate metadata generation (sitemap, RSS, search-index, tag/category pages).

Quick commands (requires Node 16+):

```powershell
# generate site metadata locally
npm ci
npm run generate

# apply a merged JSON file and commit locally
.\scripts\commit-post.ps1 -MergedFilePath .\news-merged-my-post.json -Type news -Message "Add news post"
git push
```

GitHub Action `Generate site metadata` will run on push/PR and commit generated files back into the repo automatically.

Admin UI
- `/admin/panel.html` includes an admin UI that can prepare merged JSON files for you to download and commit. It uses `assets/js/utilities.js` and `assets/js/admin.js`.
