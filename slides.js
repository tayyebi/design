(function() {
  // ── Child slide context (runs inside iframe) ──
  if (window.self !== window.top) {
    var params = new URLSearchParams(window.location.search);
    if (params.get('theme') === 'dark') {
      document.documentElement.className = 'dark-theme';
    }
    window.addEventListener('message', function(e) {
      if (e.data && e.data.theme !== undefined) {
        document.documentElement.className = e.data.theme ? 'dark-theme' : '';
      }
    });
    var touchStartX = 0;
    document.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    document.addEventListener('touchend', function(e) {
      var diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        parent.postMessage({ swipe: diff > 0 ? 'prev' : 'next' }, '*');
      }
    }, { passive: true });
    return;
  }

  // ── Parent context (index.html) ──
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

  function themeQuery() {
    return toggle && toggle.checked ? '?theme=dark' : '';
  }

  function sendTheme() {
    var iframe = frame.contentWindow;
    if (iframe) {
      iframe.postMessage({ theme: toggle && toggle.checked }, '*');
    }
  }

  function loadSlide(index) {
    current = index;
    frame.src = slideFiles[index] + themeQuery();
    updateCounter();
    updateDots();
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

  // Listen for swipe events from iframe
  window.addEventListener('message', function(e) {
    if (e.data && e.data.swipe) {
      if (e.data.swipe === 'prev' && current > 0) loadSlide(current - 1);
      if (e.data.swipe === 'next' && current < total - 1) loadSlide(current + 1);
    }
  });

  // Create dots
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

  // Theme toggle → send to iframe
  if (toggle) {
    toggle.addEventListener('change', function() {
      sendTheme();
    });
  }

  // Initial load
  loadSlide(0);
})();
