#!/usr/bin/env node
// Builds compressed web galleries from raw photos dropped into
// _originals/<category>/<event>/, e.g. _originals/cars/2026-porsche-cc-may/.
// Usage: npm run build-galleries   (see scripts/README.md)

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const exifr = require('exifr');

const ROOT = path.resolve(__dirname, '..');
const ORIGINALS_DIR = path.join(ROOT, '_originals');
const GALLERIES_DIR = path.join(ROOT, 'galleries');

const FULL_MAX = 2000; // px, long edge
const FULL_QUALITY = 82;
const THUMB_WIDTH = 500; // px, wide edge
const THUMB_QUALITY = 75;

const IMAGE_EXT = /\.(jpe?g|png)$/i;

function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function prettify(slug) {
  const spaced = slug.replace(/[-_]+/g, ' ').trim();
  // Only force title-case for plain dash/underscore slugs (e.g. "2026-porsche-cc-may").
  // A folder name that already has capitals (e.g. "2026 Rides on Richmond") is
  // kept as-is so words like "on"/"the" aren't awkwardly capitalized.
  if (/[A-Z]/.test(slug)) return spaced;
  return spaced.replace(/\b\w/g, (c) => c.toUpperCase());
}

function sortByDateThenTitle(a, b) {
  if (a.date && b.date) return b.date.localeCompare(a.date);
  if (a.date) return -1;
  if (b.date) return 1;
  return a.title.localeCompare(b.title);
}

function formatDevice(make, model) {
  if (!make && !model) return null;
  if (!make) return model;
  if (!model) return make;
  if (model.toUpperCase().startsWith(make.toUpperCase())) return model;
  return `${make} ${model}`;
}

function formatFocalLength(mm) {
  const rounded = Math.round(mm * 10) / 10;
  return `${rounded} mm`;
}

function formatAperture(fNumber) {
  const rounded = Math.round(fNumber * 10) / 10;
  return `f/${rounded}`;
}

function formatExposureTime(seconds) {
  if (seconds >= 1) {
    const rounded = Math.round(seconds * 10) / 10;
    return `${rounded} sec`;
  }
  const denominator = Math.round(1 / seconds);
  return `1/${denominator} sec`;
}

function formatExposureBias(ev) {
  if (ev === 0) return 'EXP 0';
  const sign = ev > 0 ? '+' : '';
  const rounded = Math.round(ev * 10) / 10;
  return `EXP ${sign}${rounded}`;
}

// Decodes the EXIF Flash tag bitmask (EXIF 2.2 spec, tag 0x9209) into a short
// human-readable string, e.g. 0x10 -> "No flash, compulsory".
function decodeFlash(value) {
  const fired = value & 0x1;
  const returnLight = (value >> 1) & 0x3;
  const mode = (value >> 3) & 0x3;
  const hasFunction = !((value >> 5) & 0x1);
  const redEye = (value >> 6) & 0x1;

  if (!hasFunction) return 'No flash function';

  const parts = [fired ? 'Flash fired' : 'No flash'];
  if (fired) {
    if (returnLight === 2) parts.push('return not detected');
    else if (returnLight === 3) parts.push('return detected');
  }
  if (mode === 1) parts.push('compulsory firing');
  else if (mode === 2) parts.push('compulsory');
  else if (mode === 3) parts.push('auto');
  if (redEye) parts.push('red-eye reduction');

  return parts.join(', ');
}

async function readExifSummary(srcPath) {
  let raw;
  try {
    raw = await exifr.parse(srcPath, {
      tiff: false,
      exif: true,
      translateValues: false,
      pick: ['Make', 'Model', 'FNumber', 'ExposureTime', 'ISO', 'FocalLength', 'ExposureCompensation', 'Flash'],
    });
  } catch (e) {
    raw = null;
  }
  if (!raw) return null;

  const summary = {
    device: formatDevice(raw.Make, raw.Model),
    focalLength: raw.FocalLength != null ? formatFocalLength(raw.FocalLength) : null,
    aperture: raw.FNumber != null ? formatAperture(raw.FNumber) : null,
    exposureTime: raw.ExposureTime != null ? formatExposureTime(raw.ExposureTime) : null,
    iso: raw.ISO != null ? `ISO ${raw.ISO}` : null,
    exposureBias: raw.ExposureCompensation != null ? formatExposureBias(raw.ExposureCompensation) : null,
    flash: raw.Flash != null ? decodeFlash(raw.Flash) : null,
  };

  const hasAnyValue = Object.values(summary).some((v) => v != null);
  return hasAnyValue ? summary : null;
}

async function processEvent(categorySlug, eventSlug) {
  const srcDir = path.join(ORIGINALS_DIR, categorySlug, eventSlug);
  const outDir = path.join(GALLERIES_DIR, categorySlug, eventSlug);
  const fullDir = path.join(outDir, 'full');
  const thumbDir = path.join(outDir, 'thumbs');
  fs.mkdirSync(fullDir, { recursive: true });
  fs.mkdirSync(thumbDir, { recursive: true });

  const files = fs.readdirSync(srcDir).filter((f) => IMAGE_EXT.test(f)).sort();
  const manifest = [];

  for (const file of files) {
    const base = file.replace(IMAGE_EXT, '');
    const outName = `${base}.webp`;
    const srcPath = path.join(srcDir, file);
    const fullPath = path.join(fullDir, outName);
    const thumbPath = path.join(thumbDir, outName);

    await sharp(srcPath)
      .rotate() // auto-orient from EXIF, then the pipeline strips metadata
      .resize({ width: FULL_MAX, height: FULL_MAX, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: FULL_QUALITY })
      .toFile(fullPath);

    await sharp(srcPath)
      .rotate()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toFile(thumbPath);

    const { width, height } = await sharp(fullPath).metadata();
    const exif = await readExifSummary(srcPath);
    manifest.push({ file: outName, width, height, exif });

    console.log(`  ${file} -> ${outName}`);
  }

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const metaPath = path.join(outDir, 'gallery.json');
  let galleryMeta = { title: prettify(eventSlug), date: '' };
  if (fs.existsSync(metaPath)) {
    try {
      galleryMeta = { ...galleryMeta, ...JSON.parse(fs.readFileSync(metaPath, 'utf8')) };
    } catch (e) {
      console.warn(`  warning: could not parse existing ${metaPath}, using defaults`);
    }
  }
  fs.writeFileSync(metaPath, JSON.stringify(galleryMeta, null, 2));
}

function readEvent(categorySlug, eventSlug) {
  const outDir = path.join(GALLERIES_DIR, categorySlug, eventSlug);
  const manifestPath = path.join(outDir, 'manifest.json');
  const metaPath = path.join(outDir, 'gallery.json');
  if (!fs.existsSync(manifestPath) || !fs.existsSync(metaPath)) return null;

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const galleryMeta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

  return {
    slug: eventSlug,
    title: galleryMeta.title,
    date: galleryMeta.date,
    count: manifest.length,
    cover: manifest[0] ? manifest[0].file : null,
    manifest,
  };
}

function readOrCreateCategoryMeta(categorySlug) {
  const metaPath = path.join(GALLERIES_DIR, categorySlug, 'category.json');
  let categoryMeta = { title: prettify(categorySlug) };
  if (fs.existsSync(metaPath)) {
    try {
      categoryMeta = { ...categoryMeta, ...JSON.parse(fs.readFileSync(metaPath, 'utf8')) };
    } catch (e) {
      console.warn(`  warning: could not parse existing ${metaPath}, using defaults`);
    }
  }
  fs.writeFileSync(metaPath, JSON.stringify(categoryMeta, null, 2));
  return categoryMeta;
}

function renderEventPage(category, event) {
  const items = event.manifest.map((img, i) => `
    <button class="gallery-item" data-full="full/${img.file}" aria-label="Open photo ${i + 1} of ${event.manifest.length}">
      <img src="thumbs/${img.file}" width="${img.width}" height="${img.height}" loading="lazy" alt="${escapeHtml(event.title)} photo ${i + 1}">
    </button>`).join('\n');

  const exifData = event.manifest.map((img) => img.exif || null);
  const exifJson = JSON.stringify(exifData).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(event.title)} — ${escapeHtml(category.title)} — Riley Marcoux Photo</title>
<meta name="description" content="Photo gallery: ${escapeHtml(event.title)}">
<link rel="icon" href="../../../favicon.ico">
<link rel="stylesheet" href="../../../assets/gallery/gallery.css">
</head>
<body class="gallery-page">
<header class="gallery-header">
  <div class="gallery-breadcrumb">
    <a href="../../">All Galleries</a>
    <span class="gallery-breadcrumb-sep">/</span>
    <a href="../">${escapeHtml(category.title)}</a>
  </div>
  <h1>${escapeHtml(event.title)}</h1>
  ${event.date ? `<p class="gallery-date">${escapeHtml(event.date)}</p>` : ''}
</header>
<main class="gallery-grid">
${items}
</main>
<script type="application/json" id="gallery-exif">${exifJson}</script>
<div class="lightbox" id="lightbox" hidden>
  <button class="lightbox-close" aria-label="Close">&times;</button>
  <button class="lightbox-prev" aria-label="Previous">&#8249;</button>
  <img class="lightbox-image" id="lightbox-image" alt="">
  <button class="lightbox-next" aria-label="Next">&#8250;</button>
  <div class="lightbox-bottom">
    <div class="lightbox-info" id="lightbox-info" hidden>
      <p class="lightbox-info-device" id="lightbox-info-device"></p>
      <div class="lightbox-info-settings" id="lightbox-info-settings"></div>
    </div>
    <div class="lightbox-counter" id="lightbox-counter"></div>
  </div>
</div>
<script src="../../../assets/gallery/gallery.js" defer></script>
</body>
</html>
`;
}

function renderCardGrid(cards) {
  return cards.length
    ? `<div class="gallery-list-grid">${cards.join('\n')}</div>`
    : `<p class="gallery-empty">No galleries yet — check back soon.</p>`;
}

function renderCategoryPage(category) {
  const cards = category.events.map((event) => `
      <a class="gallery-card" href="./${event.slug}/">
        <div class="gallery-card-image">
          ${event.cover ? `<img src="./${event.slug}/thumbs/${event.cover}" loading="lazy" alt="${escapeHtml(event.title)}">` : ''}
        </div>
        <div class="gallery-card-body">
          <p class="gallery-card-title">${escapeHtml(event.title)}</p>
          <p class="gallery-card-meta">${event.date ? `${escapeHtml(event.date)} · ` : ''}${event.count} photo${event.count === 1 ? '' : 's'}</p>
        </div>
      </a>`);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(category.title)} — Riley Marcoux Photo</title>
<meta name="description" content="Photo galleries: ${escapeHtml(category.title)}">
<link rel="icon" href="../../favicon.ico">
<link rel="stylesheet" href="../../assets/gallery/gallery.css">
</head>
<body class="gallery-page">
<header class="gallery-header">
  <a href="../" class="back-link">&larr; All Galleries</a>
  <h1>${escapeHtml(category.title)}</h1>
</header>
<main>
${renderCardGrid(cards)}
</main>
</body>
</html>
`;
}

function renderTopIndexPage(categories) {
  const cards = categories.map((category) => {
    const cover = category.events[0];
    return `
      <a class="gallery-card" href="./${category.slug}/">
        <div class="gallery-card-image">
          ${cover && cover.cover ? `<img src="./${category.slug}/${cover.slug}/thumbs/${cover.cover}" loading="lazy" alt="${escapeHtml(category.title)}">` : ''}
        </div>
        <div class="gallery-card-body">
          <p class="gallery-card-title">${escapeHtml(category.title)}</p>
          <p class="gallery-card-meta">${category.events.length} galler${category.events.length === 1 ? 'y' : 'ies'}</p>
        </div>
      </a>`;
  });

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Photo Galleries — Riley Marcoux Photo</title>
<meta name="description" content="Photo galleries by Riley Marcoux.">
<link rel="icon" href="../favicon.ico">
<link rel="stylesheet" href="../assets/gallery/gallery.css">
</head>
<body class="gallery-page">
<header class="gallery-header">
  <a href="../card/" class="back-link">&larr; Contact Card</a>
  <h1>Photo Galleries</h1>
</header>
<main>
${renderCardGrid(cards)}
</main>
</body>
</html>
`;
}

async function main() {
  fs.mkdirSync(GALLERIES_DIR, { recursive: true });

  let hadErrors = false;

  for (const categorySlug of listDirs(ORIGINALS_DIR)) {
    const eventSlugs = listDirs(path.join(ORIGINALS_DIR, categorySlug));

    for (const eventSlug of eventSlugs) {
      console.log(`Building gallery: ${categorySlug} / ${eventSlug}`);
      try {
        await processEvent(categorySlug, eventSlug);
        // Originals are expected to be backed up elsewhere (e.g. a NAS) before
        // running this script — once an event builds successfully, its source
        // photos are deleted here so they never get committed to git.
        fs.rmSync(path.join(ORIGINALS_DIR, categorySlug, eventSlug), { recursive: true, force: true });
        console.log('  done, removed local originals (make sure they are backed up elsewhere)');
      } catch (err) {
        hadErrors = true;
        console.error(`  failed to build "${categorySlug}/${eventSlug}", leaving its originals in place:`, err.message);
      }
    }
    // The category folder itself (e.g. _originals/Cars/) is left in place even
    // once empty, so it stays ready as a drop-box for the next event.
  }

  // galleries/ is the durable source of truth once originals are deleted, so
  // every page is always regenerated from what's on disk there rather than
  // from what was just (re)built above.
  const categories = [];
  for (const categorySlug of listDirs(GALLERIES_DIR)) {
    const events = listDirs(path.join(GALLERIES_DIR, categorySlug))
      .map((eventSlug) => readEvent(categorySlug, eventSlug))
      .filter(Boolean);

    if (events.length === 0) continue; // empty or malformed category folder, skip

    events.sort(sortByDateThenTitle);

    const categoryMeta = readOrCreateCategoryMeta(categorySlug);
    categories.push({ slug: categorySlug, title: categoryMeta.title, events });
  }

  categories.sort((a, b) => a.title.localeCompare(b.title));

  for (const category of categories) {
    for (const event of category.events) {
      fs.writeFileSync(
        path.join(GALLERIES_DIR, category.slug, event.slug, 'index.html'),
        renderEventPage(category, event),
      );
    }
    fs.writeFileSync(path.join(GALLERIES_DIR, category.slug, 'index.html'), renderCategoryPage(category));
  }

  fs.writeFileSync(path.join(GALLERIES_DIR, 'index.html'), renderTopIndexPage(categories));

  const eventCount = categories.reduce((n, c) => n + c.events.length, 0);
  console.log(`Done. ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}, ${eventCount} gallery(ies) published.`);

  if (hadErrors) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
