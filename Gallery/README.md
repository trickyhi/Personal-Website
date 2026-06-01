# Auto-Discovery Image Gallery Setup

## How to Use (No Code Changes Needed!)

### Adding a New Gallery - Simple Flat Structure

**For a single gallery:**
```
Gallery/
├── cars.md
└── cars/
    ├── photo1.jpg
    ├── photo2.jpg
```

Create `Gallery/cars.md`:
```markdown
---
layout: gallery
title: Cars
---
```

Then add images to `Gallery/cars/` folder.

---

### Adding Nested Galleries - Multiple Events in Categories

**For nested galleries (e.g., multiple card events):**
```
Gallery/
├── cards-event1.md
├── cards-event2.md
├── cards-event1/
│   ├── photo1.jpg
│   └── photo2.jpg
└── cards-event2/
    ├── photo1.jpg
    └── photo2.jpg
```

**Method 1: Flat naming** (recommended for simplicity)
- Create `Gallery/cards-event1.md` → images go in `Gallery/cards-event1/`
- Create `Gallery/cards-event2.md` → images go in `Gallery/cards-event2/`

**Method 2: True nested folders** (if you want better organization)
- Create `Gallery/cards/event1.md` → images go in `Gallery/cards/event1/`
- Create `Gallery/cards/event2.md` → images go in `Gallery/cards/event2/`

The system automatically finds images matching each gallery's path.

---

### Complete Example Structure

```
Gallery/
├── index.html              # Gallery index
├── README.md
│
├── cars.md                 # Gallery 1
├── cars/                   # Images for cars gallery
│   ├── 2024-lamborghini.jpg
│   └── 2024-tesla.jpg
│
├── cards-event1.md         # Gallery 2 (flat naming)
├── cards-event1/           # Images for event1
│   ├── photo1.jpg
│   └── photo2.jpg
│
├── cards/                  # Folder for nested galleries (optional organization)
│   ├── event1.md           # Gallery 3 (nested)
│   ├── event2.md           # Gallery 4 (nested)
│   ├── event1/             # Images for nested event1
│   │   └── photo.jpg
│   └── event2/             # Images for nested event2
│       └── photo.jpg
```

---

### Key Points

- **Filename matches folder:** `cars.md` must have a `cars/` folder
- **Nested paths work:** `cards/event1.md` needs `cards/event1/` folder
- **Supported formats:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- **Automatic sorting:** Images displayed alphabetically
- **No file lists needed:** Just add images to the folder
- **Auto-generated pages:** Gallery index lists all automatically

---

### Quick Start

1. Create a markdown file: `Gallery/your-gallery-name.md`
2. Add YAML front matter with layout and title
3. Create matching folder: `Gallery/your-gallery-name/`
4. Add images to that folder
5. Done! Gallery auto-generates

That's it! The site discovers and displays all images automatically.

