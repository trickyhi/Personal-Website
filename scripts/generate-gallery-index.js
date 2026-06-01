const fs = require('fs');
const path = require('path');

const galleryDir = path.resolve(__dirname, '..', 'Gallery');
const outFile = path.join(galleryDir, 'index.html');

function findThumbnail(dir) {
  const candidates = [
    path.join(dir, 'images', 'thumbnails'),
    path.join(dir, 'assets', 'images', 'thumbnails'),
    path.join(dir, 'images', 'large'),
    path.join(dir, 'assets', 'images', 'large'),
    path.join(dir, 'images'),
    path.join(dir, 'assets', 'images'),
  ];

  for (const c of candidates) {
    if (!fs.existsSync(c)) continue;
    const files = fs.readdirSync(c).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f));
    if (files.length) return path.relative(galleryDir, path.join(c, files[0])).split(path.sep).join('/');
  }
  return null;
}

function generate() {
  if (!fs.existsSync(galleryDir)) {
    console.error('Gallery folder not found:', galleryDir);
    process.exit(1);
  }

  const entries = fs.readdirSync(galleryDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort((a,b)=>a.localeCompare(b, undefined, {sensitivity:'base'}));

  const items = entries.map(name => {
    const dir = path.join(galleryDir, name);
    const thumb = findThumbnail(dir);
    return { name, thumb };
  });

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Galleries</title>
  <link rel="stylesheet" href="../assets/css/main.css">
  <style>
    .galleries {display:flex;flex-wrap:wrap;gap:1rem}
    .gallery-card {width:220px;text-align:center}
    .gallery-card img{max-width:100%;height:auto;border-radius:4px}
    .gallery-card a{display:block;margin-top:0.5rem;color:inherit;text-decoration:none}
  </style>
</head>
<body>
  <header>
    <h1>Galleries</h1>
  </header>
  <main>
    <section class="galleries">
      ${items.map(it => `
      <article class="gallery-card">
        <a href="./${it.name}/index.html">
          ${it.thumb ? `<img src="./${it.thumb}" alt="${it.name} thumbnail">` : '<div style="width:100%;height:140px;background:#eee;border-radius:4px"></div>'}
          <strong>${it.name}</strong>
        </a>
      </article>
      `).join('\n')}
    </section>
  </main>
</body>
</html>`;

  fs.writeFileSync(outFile, html, 'utf8');
  console.log('Wrote', outFile);
}

if (require.main === module) generate();

module.exports = { generate };
