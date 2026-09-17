# _originals

A **transient staging folder**, not permanent storage. Drop your full-resolution
exported photos for a gallery into a subfolder here, e.g.:

```
_originals/2026-porsche-cc-may/DSC02788.jpg
_originals/2026-porsche-cc-may/DSC02792.jpg
...
```

Then run `npm run build-galleries` from the repo root.

**Make sure the originals are already backed up elsewhere (e.g. your NAS) first** —
once a gallery builds successfully, the build script deletes its folder here.
This folder is also excluded from git (see `.gitignore`) and from the published
site (Jekyll ignores any `_`-prefixed directory), so nothing here is ever
committed or served — it only exists on your local machine between dropping
photos in and running the build.

The compressed, web-ready versions that actually get committed and published
live in `galleries/<slug>/`.

See [scripts/README.md](../scripts/README.md) for full instructions.
