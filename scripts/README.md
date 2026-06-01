Generate Gallery landing page

Usage:

1. Ensure Node.js is installed.
2. From the repository root run:

```bash
node scripts/generate-gallery-index.js
```

This writes `Gallery/index.html`, scanning each subfolder for thumbnail images in common locations (`images/thumbnails`, `assets/images/thumbnails`, `images/large`, ...).
