# _originals

A **transient staging folder**, not permanent storage. Drop your full-resolution
exported photos into `<category>/<event>/`, e.g.:

```
_originals/Cars/2026-porsche-cc-may/DSC02788.jpg
_originals/Cars/2026-porsche-cc-may/DSC02792.jpg
_originals/Airshows/2026-london-airshow/DSC04501.jpg
...
```

The category folder (`Cars`, `Airshows`, ...) groups related events together on
the site; the event folder underneath is the actual photo gallery. Then run
`npm run build-galleries` from the repo root (or double-click
`REGENERATE GALLERIES.bat`).

**Make sure the originals are already backed up elsewhere (e.g. your NAS) first** —
once an event builds successfully, the build script deletes its folder here.
The category folder itself (`Cars/`, `Airshows/`, ...) is left in place even
once empty, so it stays ready as a drop-box for the next event — this repo
currently has `Cars/` and `Airshows/` standing by. Create a new one the same
way any time you start a new category. This folder is also excluded from git
(see `.gitignore`) and from the published site (Jekyll ignores any
`_`-prefixed directory), so nothing here is ever committed or served — it
only exists on your local machine between dropping photos in and running the
build.

The compressed, web-ready versions that actually get committed and published
live in `galleries/<category>/<event>/`.

See [scripts/README.md](../scripts/README.md) for full instructions.
