(function() {
  if (window.self !== window.top) {
    window.addEventListener('message', function(e) {
      if (e.data && e.data.theme !== undefined) {
        document.documentElement.className = e.data.theme ? 'dark-theme' : '';
      }
    });
    var touchStartX = 0, touchStartY = 0;
    document.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    document.addEventListener('touchend', function(e) {
      var dx = touchStartX - e.changedTouches[0].screenX;
      var dy = touchStartY - e.changedTouches[0].screenY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        parent.postMessage({ swipe: dx > 0 ? 'prev' : 'next' }, '*');
      }
    }, { passive: true });
    return;
  }

  var slideFiles = [
    'slides/01-title.htm',
    'slides/02-logos.htm',
    'slides/03-palette.htm',
    'slides/04-typography.htm',
    'slides/05-buttons.htm',
    'slides/06-forms.htm',
    'slides/07-cards.htm',
    'slides/08-nav.htm',
    'slides/09-data.htm',
    'slides/10-feedback.htm',
    'slides/11-interactive.htm',
    'slides/12-code.htm',
    'slides/13-patterns.htm',
    'slides/14-usage.htm'
  ];

  var total = slideFiles.length;
  var current = 0;

  var frame = document.getElementById('slide-frame');
  var counter = document.getElementById('counter');
  var dots = document.getElementById('dots');
  var prevBtn = document.getElementById('prev');
  var nextBtn = document.getElementById('next');
  var toggle = document.getElementById('theme-toggle');

  var baseUrl = window.location.href.replace(/index\.html$/, '');

  function wrapContent(bodyContent, index, isDark) {
    var cls = index === 0 ? 'slide-page slide-page--center' : 'slide-page';
    var themeClass = isDark ? ' dark-theme' : '';
    return '<!DOCTYPE html><html lang="fa" dir="rtl" class="' + themeClass + '"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><base href="' + baseUrl + '"><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="style.css"><link rel="stylesheet" href="slides.css"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lalezar&display=swap"><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/sahel-font@v3.4.0/dist/font-face.css"><script src="slides.js"><\/script></head><body class="' + cls + '">' + bodyContent + '</body></html>';
  }

  function loadSlide(index) {
    current = index;
    frame.classList.remove('ready');
    var isDark = toggle && toggle.checked;
    fetch(slideFiles[index]).then(function(r) { return r.text(); }).then(function(html) {
      frame.srcdoc = wrapContent(html, index, isDark);
      updateCounter();
      updateDots();
    });
  }

  function updateCounter() {
    counter.textContent = (current + 1) + ' / ' + total;
  }

  function updateDots() {
    var allDots = dots.querySelectorAll('[role="tab"]');
    for (var i = 0; i < allDots.length; i++) {
      allDots[i].setAttribute('aria-selected', i === current ? 'true' : 'false');
    }
  }

  window.addEventListener('message', function(e) {
    if (e.data && e.data.swipe) {
      if (e.data.swipe === 'prev' && current > 0) loadSlide(current - 1);
      if (e.data.swipe === 'next' && current < total - 1) loadSlide(current + 1);
    }
  });

  frame.addEventListener('load', function() {
    frame.classList.add('ready');
  });

  for (var i = 0; i < total; i++) {
    var li = document.createElement('li');
    var btn = document.createElement('button');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.setAttribute('aria-label', 'اسلاید ' + (i + 1));
    btn.tabIndex = 0;
    (function(idx) {
      btn.addEventListener('click', function() { loadSlide(idx); });
    })(i);
    li.appendChild(btn);
    dots.appendChild(li);
  }

  prevBtn.addEventListener('click', function() {
    if (current > 0) loadSlide(current - 1);
  });
  nextBtn.addEventListener('click', function() {
    if (current < total - 1) loadSlide(current + 1);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (current < total - 1) loadSlide(current + 1);
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (current > 0) loadSlide(current - 1);
    }
  });

  if (toggle) {
    toggle.addEventListener('change', function() {
      sendTheme();
    });
  }

  function sendTheme() {
    var iframe = frame.contentWindow;
    if (iframe) {
      iframe.postMessage({ theme: toggle && toggle.checked }, '*');
    }
  }

  loadSlide(0);
})();
