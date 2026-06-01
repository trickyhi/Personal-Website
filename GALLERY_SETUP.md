# Image Gallery Setup Guide

Your Jekyll site is already configured for galleries! Everything goes in one simple `/gallery` folder.

## Quick Setup (One-time)

1. **Create a gallery folder** in your repository root:
   - `gallery/` - for both markdown files AND photo folders

2. **Create a new gallery** by doing:
   - Create a folder: `gallery/your-gallery-name/` (use lowercase with hyphens)
   - Add your image files (.jpg, .png, etc) to that folder
   - Create a markdown file: `gallery/your-gallery-name.md` with this content:

```yaml
---
layout: gallery
title: Your Gallery Title
---
```

That's it! The gallery will automatically appear at: `https://rmarcoux.com/gallery/your-gallery-name/`

## Example

To create a "London Streets" gallery:

1. Create folder: `gallery/london-streets/`
2. Add photos: `gallery/london-streets/photo1.jpg`, `gallery/london-streets/photo2.jpg`, etc.
3. Create: `gallery/london-streets.md`:
```yaml
---
layout: gallery
title: London Streets
---
```

Visit: `https://rmarcoux.com/gallery/london-streets/`

## Features

✅ **Auto Grid Display** - Photos arranged in responsive grid
✅ **Image Carousel** - Click any photo to open full-size lightbox with navigation arrows
✅ **Lazy Loading** - Images load on-demand for fast page loads
✅ **Hover Effects** - Subtle zoom effect on hover
✅ **No Configuration** - Just add folder + markdown file

## Gallery Naming Rules

- Use **lowercase** with **hyphens** (not spaces or underscores)
- Examples: `london-streets`, `car-show-2024`, `automotive-detail`
- Folder name must match markdown filename (without .md)

## File Organization

```
trickyhi.github.io/
├── gallery/
│   ├── london-streets.md
│   ├── london-streets/
│   │   ├── photo1.jpg
│   │   ├── photo2.jpg
│   │   └── photo3.jpg
│   ├── car-shows.md
│   ├── car-shows/
│   │   └── cars.jpg
│   ├── automotive-detail.md
│   └── automotive-detail/
│       └── detail.jpg
```

## Deploying

After adding galleries:
1. Commit the folders and files to git
2. Push to GitHub
3. Your site will rebuild automatically (GitHub Pages)
4. New gallery appears in 5-10 seconds

## Tips

- Keep image file sizes reasonable (2-5MB for full-quality photos is good)
- JPG format is best for photos
- Gallery titles can have any formatting in the markdown file (case, spaces, special chars)
- The folder/filename still need to be lowercase with hyphens
