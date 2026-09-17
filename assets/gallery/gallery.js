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

  let currentIndex = -1;

  function renderInfo(index) {
    if (!infoPanel) return;
    const exif = exifData[index];
    const settings = exif
      ? [exif.focalLength, exif.aperture, exif.exposureTime, exif.iso, exif.exposureBias, exif.flash].filter(Boolean)
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
