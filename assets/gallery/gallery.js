(function () {
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

  let exifData = [];
  const exifDataEl = document.getElementById('gallery-exif');
  if (exifDataEl) {
    try {
      exifData = JSON.parse(exifDataEl.textContent) || [];
    } catch (e) {
      exifData = [];
    }
  }

  // Wrap the image so the shot-info overlay can sit on its bottom-left corner.
  const frame = document.createElement('div');
  frame.className = 'lightbox-frame';
  lightboxImage.parentNode.insertBefore(frame, lightboxImage);
  frame.appendChild(lightboxImage);
  const overlay = document.createElement('ul');
  overlay.className = 'lightbox-overlay';
  overlay.hidden = true;
  frame.appendChild(overlay);

  let currentIndex = -1;

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

  function open(index) {
    currentIndex = index;
    const item = items[index];
    lightboxImage.src = item.dataset.full;
    lightboxImage.alt = item.querySelector('img').alt;
    counter.textContent = `${index + 1} / ${items.length}`;
    renderInfo(index);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    preload(index - 1);
    preload(index + 1);
  }

  function close() {
    lightbox.hidden = true;
    lightboxImage.src = '';
    document.body.style.overflow = '';
    currentIndex = -1;
  }

  function show(delta) {
    if (currentIndex === -1) return;
    open((currentIndex + delta + items.length) % items.length);
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
  });

  let touchStartX = null;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) show(dx > 0 ? -1 : 1);
    touchStartX = null;
  }, { passive: true });
})();
