# Photo gallery build script

This turns full-resolution photos into compressed, web-ready galleries at
`https://rmarcoux.com/galleries/`.

## One-time setup

1. Install [Node.js](https://nodejs.org/) (LTS version) if you don't already have it.
2. From the repo root, install dependencies:

   ```bash
   npm install
   ```

## Adding a new gallery

1. **Make sure your full-resolution photos are already backed up elsewhere first**
   (e.g. your NAS) — the build script deletes them from this repo once it's done
   with them (see step 3).

2. Create a folder under `_originals/` named after the gallery, using lowercase
   words separated by dashes — this becomes the URL slug:

   ```
   _originals/2026-porsche-cc-may/
   ```

   Copy your exported JPEGs (or PNGs) into that folder.

3. Run the build script from the repo root:

   ```bash
   npm run build-galleries
   ```

   This, for every gallery folder under `_originals/`:
   - resizes and compresses each photo to WebP (a full-size version capped at
     2000px on the long edge, plus a small thumbnail for the grid), writing them
     to `galleries/<slug>/full/` and `galleries/<slug>/thumbs/`
   - reads camera/shot info (model, focal length, aperture, shutter speed, ISO,
     exposure compensation, flash) from each photo's EXIF data and saves it to
     `galleries/<slug>/manifest.json`, so it can be shown in the on-site lightbox
   - **deletes the `_originals/<slug>/` folder** once that gallery has built
     successfully — this repo is not where your originals live long-term

   It then (re)generates every gallery's `index.html` plus the top-level
   `galleries/index.html` listing page, from whatever is currently in `galleries/`
   (not just what was built this run).

4. (Optional) Open `galleries/<slug>/gallery.json` and set a nicer `title` and a
   `date` (e.g. `"2026-05-01"`) — galleries are sorted newest-first by this date.
   Re-run `npm run build-galleries` afterward to regenerate the pages with your
   change (the script preserves your edits, and doesn't need `_originals/<slug>/`
   to still exist to do this).

5. Commit `galleries/<slug>/` and push. `_originals/` is gitignored, so nothing
   from there ever gets committed.

## Removing a gallery

Delete its folder under `galleries/`, then run `npm run build-galleries` again to
regenerate the listing page without it.

## Notes

- If a gallery fails to build (e.g. a corrupt file), its `_originals/<slug>/`
  folder is left in place rather than deleted, so you can fix the problem and
  rerun without losing anything.
- `_originals/` is excluded from both git and the published site (Jekyll ignores
  any folder starting with `_`), so even if photos are sitting in there when you
  push, they won't be committed or served.
