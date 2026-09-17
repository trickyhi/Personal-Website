# Photo gallery build script

This turns full-resolution photos into compressed, web-ready galleries at
`https://rmarcoux.com/galleries/`, organized as categories (e.g. "Cars",
"Airshows") each containing individual event galleries.

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

2. Under `_originals/`, create a category folder (or reuse an existing one, e.g.
   `Cars`), and inside it an event folder named after this specific shoot:

   ```
   _originals/Cars/2026-porsche-cc-may/
   ```

   Copy your exported JPEGs (or PNGs) into that event folder. A category can
   hold as many events as you like — it's just a way of grouping related
   galleries together on the site (`/galleries/cars/` lists every event in it).

3. Run the build script from the repo root — either:

   ```bash
   npm run build-galleries
   ```

   or double-click `REGENERATE GALLERIES.bat` in the repo root.

   This, for every event folder found under `_originals/<category>/`:
   - resizes and compresses each photo to WebP (a full-size version capped at
     2000px on the long edge, plus a small thumbnail for the grid), writing them
     to `galleries/<category>/<event>/full/` and `.../thumbs/`
   - reads camera/shot info (model, focal length, aperture, shutter speed, ISO,
     exposure compensation, flash, date taken) from each photo's EXIF data and
     saves it to that event's `manifest.json`, so it can be shown in the
     on-site lightbox
   - sets that event's `date` in `gallery.json` to the earliest date-taken found
     across its photos (used to sort events and shown as "Month Year" on
     listing pages) — but only if `date` isn't already set, so a manual edit
     always wins
   - **deletes the `_originals/<category>/<event>/` folder** once that event has
     built successfully — this repo is not where your originals live long-term.
     The category folder itself (e.g. `_originals/Cars/`) is left in place even
     once empty, ready for the next event.

   It then (re)generates every event page, every category page, and the
   top-level `galleries/index.html` listing, from whatever is currently in
   `galleries/` (not just what was built this run).

4. (Optional) Open `galleries/<category>/<event>/gallery.json` and set a nicer
   `title`, or override the auto-detected `date` (format `"YYYY-MM-DD"`) if it
   picked the wrong day or none of your photos had EXIF dates. There's also
   `galleries/<category>/category.json` for the category's display `title`.
   Re-run the build script afterward to regenerate the pages with your change
   (it preserves your edits, and doesn't need `_originals/` to still exist to
   do this).

5. Commit `galleries/<category>/` and push. `_originals/` is gitignored, so
   nothing from there ever gets committed.

## Removing a gallery or category

Delete the event's folder (or a whole category's folder) under `galleries/`,
then run the build script again to regenerate the listing pages without it.

## Notes

- If an event fails to build (e.g. a corrupt file), its `_originals/<category>/<event>/`
  folder is left in place rather than deleted, so you can fix the problem and
  rerun without losing anything.
- `_originals/` is excluded from both git and the published site (Jekyll ignores
  any folder starting with `_`), so even if photos are sitting in there when you
  push, they won't be committed or served.
