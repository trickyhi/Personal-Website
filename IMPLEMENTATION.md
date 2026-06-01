# Image Gallery System - Complete Setup Guide

Your personal website now has a fully automated image gallery system! 🎉

## What You Get

✅ **Automatic Gallery Generation** - Just add image folders, galleries auto-generate
✅ **Landing Page** - `/galleries/` shows all galleries as beautiful cards with thumbnails
✅ **Lightbox Viewer** - Click images to view in fullscreen with navigation
✅ **Responsive Design** - Perfect on mobile, tablet, and desktop
✅ **No Configuration** - Folder names become gallery titles automatically
✅ **Multiple Formats** - Supports JPG, PNG, GIF, and WebP images

## Files Created

### Core Components
- **`generate-galleries.rb`** - Main script that generates all galleries
- **`_layouts/gallery.html`** - Template for individual gallery pages
- **`setup-galleries.bat`** / `setup-galleries.ps1` / `setup-galleries.sh`** - Setup scripts for different platforms

### Configuration Updated
- **`_config.yml`** - Updated to point to `_galleries` collection

### Documentation
- **`GALLERY_QUICKSTART.md`** - Quick start guide (read this first!)
- **`GALLERY_SETUP.md`** - Detailed setup and customization guide
- **`IMPLEMENTATION.md`** - This file

## Directory Structure After Setup

```
trickyhi.github.io/
├── assets/
│   └── images/              ← Put your image folders here
│       ├── my-event/
│       │   ├── photo1.jpg
│       │   └── photo2.jpg
│       └── london-trip/
│           ├── image1.jpg
│           └── image2.jpg
├── _galleries/              ← Auto-generated (don't edit)
│   ├── my-event.md
│   └── london-trip.md
├── galleries/
│   └── index.md            ← Auto-generated landing page
├── _layouts/
│   ├── gallery.html        ← Gallery page template
│   └── default.html        ← Main layout
└── generate-galleries.rb   ← Run this script
```

## How It Works

### 1. Initialization (First Time)
Run one of the setup scripts to create directories:
```bash
# Choose one:
setup-galleries.bat        # Windows Command Prompt
.\setup-galleries.ps1      # Windows PowerShell  
bash setup-galleries.sh    # Mac/Linux
```

### 2. Add Images
Create folders in `assets/images/` with your photos:
```
assets/images/
  └── my-gallery-name/
      ├── photo1.jpg
      ├── photo2.jpg
      └── photo3.jpg
```

### 3. Generate Galleries
Run the Ruby script:
```bash
ruby generate-galleries.rb
```

This:
- Scans `assets/images/` for folders
- Creates metadata files in `_galleries/`
- Generates `galleries/index.md` landing page
- Uses folder name as gallery title (converts `my-gallery-name` → "My Gallery Name")

### 4. Preview
```bash
jekyll serve
```

Visit:
- **All galleries**: http://localhost:4000/galleries/
- **Single gallery**: http://localhost:4000/gallery/my-gallery-name/

### 5. Deploy
GitHub Pages automatically builds Jekyll:
```bash
git add .
git commit -m "Add image galleries"
git push
```

Your galleries are now live at `https://rmarcoux.com/galleries/`

## Key Features

### Automatic Naming
- `summer-2024` → "Summer 2024"
- `london_photos` → "London Photos"  
- `MyVacation` → "My Vacation"

### Supported Formats
- JPG, JPEG
- PNG
- GIF
- WebP

### Lightbox Controls
- **Click image** to open fullscreen
- **Arrow keys** to navigate
- **Close button** or **Esc** to close
- **Thumbnail dots** to jump to specific image

### Responsive Grid
- 4 columns on desktop
- 2-3 columns on tablet
- 1 column on mobile

## Customization

### Change Gallery Title
Edit the metadata file in `_galleries/` and change the `title` field

### Customize Grid Size
Edit `.gallery-grid` in `_layouts/gallery.html`:
```html
grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                       /* change 250px to your preferred width */
```

### Customize Image Height
Edit `.gallery-item img` in `_layouts/gallery.html`:
```html
height: 300px;  /* change this value */
```

### Customize Colors and Styling
Edit the `<style>` sections in:
- `_layouts/gallery.html` - Individual gallery pages
- `galleries/index.md` - Landing page (auto-generated but you can edit the template in the script)

## Troubleshooting

### No galleries showing on `/galleries/`
- Make sure you have image folders in `assets/images/`
- Run `ruby generate-galleries.rb` after adding images
- Check that images have supported extensions (.jpg, .png, etc)

### Images not loading
- Verify image paths are correct in `_galleries/*.md`
- Check that images are in `assets/images/folder-name/`
- Make sure no spaces in folder names (use hyphens instead)

### Gallery page not found (404)
- Run `ruby generate-galleries.rb` to generate the metadata
- Check that `_galleries/` folder exists
- Verify Jekyll is building the collection (check `_config.yml`)

## Next Steps

1. Read **`GALLERY_QUICKSTART.md`** for quick setup
2. Add your first image folder to `assets/images/`
3. Run `ruby generate-galleries.rb`
4. Run `jekyll serve` and visit `/galleries/`
5. Deploy to GitHub!

## Technical Details

- **Built with**: Jekyll collections, Lightbox.js, vanilla CSS Grid
- **No dependencies**: Uses CDN-hosted Lightbox, no npm packages needed
- **Static generation**: All HTML generated at build time (no server-side code)
- **GitHub Pages compatible**: Works perfectly with GitHub Pages deployment

## Questions?

Refer to the documentation files:
- `GALLERY_QUICKSTART.md` - 5-minute quick start
- `GALLERY_SETUP.md` - Detailed setup and advanced customization

Happy photographing! 📷
