// Small behaviors. The site reads and works without them.
(function () {
  'use strict';

  var root = document.documentElement;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  // Preview builds only: a button in the yellow bar hides the notes, to show the pages as they will look.
  var notesToggle = document.querySelector('[data-notes-toggle]');
  if (notesToggle) {
    var setNotes = function (off) {
      root.classList.toggle('notes-off', off);
      notesToggle.textContent = off ? 'Show notes' : 'Hide notes';
      try { window.sessionStorage.setItem('abl-notes-off', off ? '1' : ''); } catch (e) { /* storage is optional */ }
    };
    var wasOff = false;
    try { wasOff = window.sessionStorage.getItem('abl-notes-off') === '1'; } catch (e) { /* storage is optional */ }
    notesToggle.hidden = false;
    setNotes(wasOff);
    notesToggle.addEventListener('click', function () { setNotes(!root.classList.contains('notes-off')); });
  }

  // The traveling mark. Once the header has scrolled out of view, "abl" stays at the top right.
  // Every photograph gets a white copy of the mark, fixed at the same spot and clipped to the
  // photograph, so the mark reads green over the page and white over pictures.
  var mark = document.querySelector('[data-travel-mark]');
  var header = document.querySelector('.site-header');
  if (mark && header) {
    each(document.querySelectorAll('[data-photo]'), function (frame) {
      var copy = document.createElement('span');
      copy.className = 'travel-mark travel-mark-on-photo';
      copy.setAttribute('aria-hidden', 'true');
      copy.innerHTML = mark.innerHTML;
      frame.classList.add('carries-mark');
      frame.appendChild(copy);
    });

    // The links come back, on a strip of paper, when the visitor scrolls up.
    var nav = header.querySelector('.site-nav');
    var floating = null;
    if (nav) {
      floating = document.createElement('nav');
      floating.className = 'float-nav';
      floating.setAttribute('aria-label', 'Main, repeated while scrolling');
      floating.innerHTML = nav.innerHTML;
      floating.inert = true;
      document.body.appendChild(floating);
    }

    var lastY = window.pageYOffset;
    var waiting = false;
    var update = function () {
      waiting = false;
      var y = window.pageYOffset;
      var past = header.getBoundingClientRect().bottom < 0;
      root.classList.toggle('mark-on', past);
      var showNav = root.classList.contains('nav-on');
      if (!past) showNav = false;
      else if (y < lastY - 6) showNav = true;
      else if (y > lastY + 6) showNav = false;
      if (Math.abs(y - lastY) > 6) lastY = y;
      root.classList.toggle('nav-on', showNav);
      if (floating) floating.inert = !showNav;
    };
    window.addEventListener('scroll', function () {
      if (!waiting) { waiting = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // Home: fade from one photograph to the next. Visitors can pause it.
  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = hero.querySelectorAll('.hero-slide');
    var link = hero.querySelector('[data-hero-link]');
    var place = hero.querySelector('[data-hero-place]');
    var toggle = hero.querySelector('[data-hero-toggle]');
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var index = 0;
    var timer = null;
    var paused = still;

    var show = function (next) {
      slides[index].classList.remove('is-active');
      index = next % slides.length;
      var slide = slides[index];
      slide.classList.add('is-active');
      link.textContent = slide.getAttribute('data-title');
      link.setAttribute('href', slide.getAttribute('data-href'));
      place.textContent = ', ' + slide.getAttribute('data-place');
    };
    var start = function () {
      if (timer || paused || slides.length < 2) return;
      timer = window.setInterval(function () { show(index + 1); }, 9000);
    };
    var stop = function () {
      window.clearInterval(timer);
      timer = null;
    };

    if (slides.length > 1) {
      toggle.hidden = false;
      toggle.textContent = paused ? 'Play' : 'Pause';
      toggle.addEventListener('click', function () {
        paused = !paused;
        toggle.textContent = paused ? 'Play' : 'Pause';
        if (paused) stop(); else start();
      });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop(); else start();
      });
      start();
    }
  }

  // Work: one row of buttons narrows the collage.
  var grid = document.querySelector('[data-project-grid]');
  var bar = document.querySelector('[data-filters]');
  if (grid && bar) {
    var buttons = bar.querySelectorAll('[data-filter]');
    var items = grid.querySelectorAll('[data-type]');
    var apply = function (filter) {
      each(items, function (item) {
        var match = filter === 'all' ||
          (filter === 'featured' ? item.getAttribute('data-featured') === 'true' : item.getAttribute('data-type') === filter);
        item.hidden = !match;
        if (match) item.classList.add('is-in');
      });
      each(buttons, function (button) {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-filter') === filter));
      });
    };
    var fromAddress = function () {
      var wanted = decodeURIComponent((window.location.hash || '').slice(1)).toLowerCase();
      var found = Array.prototype.filter.call(buttons, function (button) {
        return button.getAttribute('data-filter').toLowerCase() === wanted;
      })[0];
      return found ? found.getAttribute('data-filter') : grid.getAttribute('data-default');
    };
    each(buttons, function (button) {
      button.addEventListener('click', function () {
        var filter = button.getAttribute('data-filter');
        apply(filter);
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '#' + filter.toLowerCase());
        }
      });
    });
    bar.hidden = false;
    var first = fromAddress();
    each(buttons, function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-filter') === first));
    });
    each(items, function (item) {
      item.hidden = !(first === 'all' ||
        (first === 'featured' ? item.getAttribute('data-featured') === 'true' : item.getAttribute('data-type') === first));
    });
  }

  // Pictures and passages fade in as they come into view.
  var targets = document.querySelectorAll('.collage > li, .drawing-row > li, .photo-row, .plan, .statement-text, .firm-text, .person, .process > li, .services dl > div, .dialogue');
  if ('IntersectionObserver' in window && targets.length) {
    var seen = new IntersectionObserver(function (entries) {
      each(entries, function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          seen.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    each(targets, function (el) {
      el.classList.add('reveal');
      seen.observe(el);
    });
  }
})();
