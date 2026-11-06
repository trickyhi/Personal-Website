// Rotating, cross-fading photo background for the contact card.
(function () {
  var SLIDES = [
    'assets/BG.jpg',
    'assets/bg/snowbirds.webp',
    'assets/bg/carrera-gt.webp',
    'assets/bg/f22.webp',
    'assets/bg/eclipse.webp',
    'assets/bg/bmw.webp',
    'assets/bg/italian-jets.webp'
  ];
  var INTERVAL = 9000;

  var host = document.createElement('div');
  host.className = 'bg-slideshow';
  host.setAttribute('aria-hidden', 'true');
  document.getElementById('background_div').prepend(host);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = null;
  var index = 0;

  function load(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = img.onerror = function () { resolve(src); };
      img.src = src;
    });
  }

  function show(src) {
    var slide = document.createElement('div');
    slide.className = 'bg-slide';
    slide.style.backgroundImage = 'url("' + src + '")';
    host.appendChild(slide);
    // Force a frame so the opacity transition runs.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { slide.classList.add('is-active'); });
    });
    if (current) {
      var old = current;
      old.classList.add('is-leaving');
      setTimeout(function () { old.remove(); }, 2200);
    }
    current = slide;
  }

  load(SLIDES[0]).then(function (src) {
    show(src);
    if (reduceMotion || SLIDES.length < 2) return;
    setInterval(function () {
      if (document.hidden) return;
      index = (index + 1) % SLIDES.length;
      // Wait for the next image to be fully loaded so the fade never shows a blank frame.
      load(SLIDES[index]).then(show);
    }, INTERVAL);
  });
})();
