// Gallery behaviour: blur-up image loading (all pages) and the photo lightbox (event pages).
(function () {
  // ---------- Blur-up: tiny preview shows first, real image fades in when ready ----------
  function fadeInWhenLoaded(img) {
    if (img.complete && img.naturalWidth > 0) return;
    img.classList.add('is-loading');
    const done = () => img.classList.remove('is-loading');
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  }
  document
    .querySelectorAll('.gallery-item img, .gallery-card-image img, .gallery-hero img')
    .forEach(fadeInWhenLoaded);

  // ---------- Lightbox ----------
  const grid = document.querySelector('.gallery-grid');
  const lightbox = document.getElementById('lightbox');
  if (!grid || !lightbox) return;

  const items = Array.from(grid.querySelectorAll('.gallery-item'));
  const lightboxImage = document.getElementById('lightbox-image');
  const counter = document.getElementById('lightbox-counter');
  const infoPanel = document.getElementById('lightbox-info');
  const infoDevice = document.getElementById('lightbox-info-device');
  const infoSettings = document.getElementById('lightbox-info-settings');
  const btnClose = lightbox.querySelector('.lightbox-close');
  const btnPrev = lightbox.querySelector('.lightbox-prev');
  const btnNext = lightbox.querySelector('.lightbox-next');
  const bottom = lightbox.querySelector('.lightbox-bottom');

  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Photo viewer');

  let exifData = [];
  const exifDataEl = document.getElementById('gallery-exif');
  if (exifDataEl) {
    try {
      exifData = JSON.parse(exifDataEl.textContent) || [];
    } catch (e) {
      exifData = [];
    }
  }

  // Blurred copy of the current photo behind everything.
  const backdrop = document.createElement('div');
  backdrop.className = 'lightbox-backdrop';
  lightbox.insertBefore(backdrop, lightbox.firstChild);

  // Wrap the image so the shot-info overlay can sit on its bottom-left corner.
  const frame = document.createElement('div');
  frame.className = 'lightbox-frame';
  lightboxImage.parentNode.insertBefore(frame, lightboxImage);
  frame.appendChild(lightboxImage);
  const overlay = document.createElement('ul');
  overlay.className = 'lightbox-overlay';
  overlay.hidden = true;
  frame.appendChild(overlay);

  // Keyboard hint (only visible with a mouse; fades out by itself).
  const hint = document.createElement('div');
  hint.className = 'lightbox-hint';
  hint.innerHTML = '<kbd>&larr;</kbd> <kbd>&rarr;</kbd> to browse &middot; <kbd>Esc</kbd> to close';
  if (bottom) bottom.appendChild(hint);
  let hintShown = false;

  let currentIndex = -1;
  let loadToken = 0;
  let lastFocused = null;

  function renderOverlay(exif) {
    overlay.innerHTML = '';
    const lines = exif ? [exif.exposureTime, exif.aperture, exif.iso].filter(Boolean) : [];
    lines.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      overlay.appendChild(li);
    });
    overlay.hidden = lines.length === 0;
  }

  function renderInfo(index) {
    const exif = exifData[index];
    renderOverlay(exif);
    if (!infoPanel) return;
    const settings = exif
      ? [exif.date, exif.focalLength, exif.exposureBias, exif.flash].filter(Boolean)
      : [];

    if (!exif || (!exif.device && settings.length === 0)) {
      infoPanel.hidden = true;
      return;
    }

    infoDevice.textContent = exif.device || '';
    infoDevice.hidden = !exif.device;

    infoSettings.innerHTML = '';
    settings.forEach((s) => {
      const chip = document.createElement('span');
      chip.className = 'lightbox-info-chip';
      chip.textContent = s;
      infoSettings.appendChild(chip);
    });

    infoPanel.hidden = false;
  }

  function preload(index) {
    if (index < 0 || index >= items.length) return;
    const img = new Image();
    img.src = items[index].dataset.full;
  }

  function thumbSrc(index) {
    return items[index].querySelector('img').currentSrc || items[index].querySelector('img').src;
  }

  // Shows photo `index`: thumbnail instantly (blurred), full-size once it has loaded.
  function setPhoto(index) {
    currentIndex = index;
    const item = items[index];
    const full = item.dataset.full;
    const thumb = thumbSrc(index);
    const token = ++loadToken;

    lightboxImage.alt = item.querySelector('img').alt;
    lightboxImage.classList.add('is-placeholder');
    lightboxImage.src = thumb;
    backdrop.style.backgroundImage = `url("${thumb}")`;

    const loader = new Image();
    loader.onload = () => {
      if (token !== loadToken) return;
      lightboxImage.src = full;
      lightboxImage.classList.remove('is-placeholder');
    };
    loader.src = full;

    counter.textContent = `${index + 1} / ${items.length}`;
    renderInfo(index);
    preload(index - 1);
    preload(index + 1);
  }

  function open(index) {
    lastFocused = document.activeElement;
    setPhoto(index);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    btnClose.focus({ preventScroll: true });

    if (!hintShown) {
      hintShown = true;
      hint.classList.remove('is-hidden');
      setTimeout(() => hint.classList.add('is-hidden'), 3500);
    } else {
      hint.classList.add('is-hidden');
    }
  }

  function close() {
    lightbox.hidden = true;
    lightboxImage.removeAttribute('src');
    backdrop.style.backgroundImage = '';
    document.body.style.overflow = '';
    const index = currentIndex;
    currentIndex = -1;
    loadToken++;
    if (index >= 0) {
      // Keep the grid where the viewer left off, and put keyboard focus back on that photo.
      items[index].scrollIntoView({ block: 'center' });
      items[index].focus({ preventScroll: true });
    } else if (lastFocused) {
      lastFocused.focus({ preventScroll: true });
    }
  }

  // Fade + slide the photo out, swap it, then fade + slide the new one in.
  let transitioning = false;
  function show(delta) {
    if (currentIndex === -1 || transitioning) return;
    transitioning = true;
    const dir = delta > 0 ? -1 : 1; // next -> old photo leaves to the left
    const next = (currentIndex + delta + items.length) % items.length;

    frame.classList.remove('is-dragging');
    frame.classList.add('is-changing');
    frame.style.transform = `translateX(${dir * 60}px)`;

    setTimeout(() => {
      setPhoto(next);
      frame.classList.add('is-dragging'); // jump to the opposite side without animating
      frame.style.transform = `translateX(${-dir * 60}px)`;
      void frame.offsetWidth;
      frame.classList.remove('is-dragging');
      frame.classList.remove('is-changing');
      frame.style.transform = '';
      transitioning = false;
    }, 220);
  }

  items.forEach((item, i) => {
    item.addEventListener('click', () => open(i));
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => show(-1));
  btnNext.addEventListener('click', () => show(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(-1);
    if (e.key === 'ArrowRight') show(1);
    if (e.key === 'Tab') {
      // Keep keyboard focus inside the viewer while it is open.
      const focusables = [btnClose, btnPrev, btnNext];
      const idx = focusables.indexOf(document.activeElement);
      e.preventDefault();
      const nextIdx = (idx + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length;
      focusables[nextIdx].focus();
    }
  });

  // ---------- Touch / pen: drag the photo, release to flip (sideways) or dismiss (down) ----------
  let drag = null;
  frame.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || transitioning) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0, t: Date.now() };
    frame.setPointerCapture(e.pointerId);
    frame.classList.add('is-dragging');
  });
  frame.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.dx = e.clientX - drag.x;
    drag.dy = e.clientY - drag.y;
    const vertical = Math.abs(drag.dy) > Math.abs(drag.dx);
    const dx = vertical ? 0 : drag.dx;
    const dy = vertical ? Math.max(0, drag.dy) : 0; // only drag downward
    frame.style.transform = `translate(${dx}px, ${dy}px)`;
    frame.style.opacity = vertical ? String(Math.max(0.3, 1 - dy / 400)) : '';
  });
  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const { dx, dy, t } = drag;
    drag = null;
    frame.classList.remove('is-dragging');
    const elapsed = Math.max(1, Date.now() - t);
    const fast = Math.abs(dx) / elapsed > 0.5; // px per ms
    const horizontal = Math.abs(dx) > Math.abs(dy);

    if (horizontal && (Math.abs(dx) > 70 || (fast && Math.abs(dx) > 25))) {
      frame.style.opacity = '';
      frame.style.transform = '';
      show(dx > 0 ? -1 : 1);
    } else if (!horizontal && dy > 110) {
      frame.style.transform = '';
      frame.style.opacity = '';
      close();
    } else {
      frame.style.transform = '';
      frame.style.opacity = '';
    }
  }
  frame.addEventListener('pointerup', endDrag);
  frame.addEventListener('pointercancel', endDrag);
})();
