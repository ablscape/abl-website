// Small behaviors. The site reads and works without them.
(function () {
  'use strict';

  var root = document.documentElement;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  // Preview builds only: a button in the bar at the top hides the notes, to show the pages as they will look.
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

  // The traveling mark. Once the header has scrolled out of view, "abl" stays at the top right. Every
  // photograph gets a white copy of the mark and every drawing a green one, fixed at the same spot and
  // clipped to the picture, so the mark reads green over the page and over drawings, and white over
  // photographs.
  var mark = document.querySelector('[data-travel-mark]');
  var header = document.querySelector('.site-header');
  if (mark && header) {
    var nav = header.querySelector('.site-nav');
    var drawLinks = function (kind) {
      var row = document.createElement('span');
      row.className = 'float-links' + (kind ? ' float-links-' + kind : '');
      row.setAttribute('aria-hidden', 'true');
      each(nav.querySelectorAll('a'), function (a) {
        var word = document.createElement('span');
        word.textContent = a.textContent;
        row.appendChild(word);
      });
      return row;
    };
    each(document.querySelectorAll('[data-photo], [data-sheet]'), function (frame) {
      var kind = frame.hasAttribute('data-photo') ? 'on-photo' : 'on-sheet';
      var copy = document.createElement('span');
      copy.className = 'travel-mark travel-mark-' + kind;
      copy.setAttribute('aria-hidden', 'true');
      copy.innerHTML = mark.innerHTML;
      frame.classList.add('carries-mark');
      frame.appendChild(copy);
      if (nav) frame.appendChild(drawLinks(kind));
    });

    // The links come back when the visitor scrolls up, drawn the way the mark is: one copy for the page
    // and one inside every picture, with the links themselves on top of everything, unseen, to take the
    // pointer and the keyboard.
    var floating = null;
    if (nav) {
      document.body.appendChild(drawLinks(''));
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

  // The ground: the firm's linework behind every page. A veil of white lies over it. Here the veil is laid
  // thinner where the ground should be stronger: in the space above the heading of each section, around a
  // remark set large, and most of all in the bare band at the foot of the page. Text needs no help from the
  // veil, since every line of it clears the ground around itself. Behind the header the veil is solid, so the
  // logo and the links stay on plain white, and it is solid around a drawing shown in the column of a page,
  // so the drawing lies on clear white. The veil is laid again whenever the page changes height.
  var ground = document.querySelector('[data-ground]');
  if (ground && header) {
    var REST = 0.64;    // the veil over the ground through the body of a page
    var JOINT = 0.30;   // where one part of a page gives way to the next
    var FOOT = 0;       // in the band at the foot of the page
    var veilNow = '';
    var veilQueued = false;
    var ease = function (t) { return t * t * (3 - 2 * t); };
    // 1 inside the span from a to b, falling to 0 over "soft" pixels on either side
    var within = function (y, a, b, soft) {
      if (y < a - soft || y > b + soft) return 0;
      if (y < a) return ease((y - (a - soft)) / soft);
      if (y > b) return ease(((b + soft) - y) / soft);
      return 1;
    };
    var layVeil = function () {
      veilQueued = false;
      var origin = ground.getBoundingClientRect().top;
      var height = ground.offsetHeight;
      if (!height) return;
      var topOf = function (el) { return el.getBoundingClientRect().top - origin; };
      var clearTo = topOf(header) + header.offsetHeight + 8;
      var joints = [];
      each(document.querySelectorAll('.section-label, .pull, .project-next, .people'), function (el) {
        if (el.closest('.statement.has-plan') || el.offsetParent === null) return;
        var y = topOf(el);
        joints.push([y - 130, y + 16]);
      });
      var clears = [];
      each(document.querySelectorAll('.plan, .project-hero.is-drawing'), function (el) {
        if (el.offsetParent === null) return;
        var y = topOf(el);
        clears.push([y - 28, y + el.offsetHeight + 28]);
      });
      var footer = document.querySelector('.site-footer');
      var bandFrom = height;
      if (footer) {
        var last = footer.lastElementChild;
        bandFrom = last ? topOf(last) + last.offsetHeight + 24 : height;
      }
      var stops = [];
      var step = 24;
      for (var y = 0; y < height + step; y += step) {
        var at = Math.min(y, height);
        var j = 0;
        for (var k = 0; k < joints.length; k += 1) j = Math.max(j, within(at, joints[k][0], joints[k][1], 150));
        var alpha = REST + (JOINT - REST) * j;
        if (at > bandFrom) alpha = alpha + (FOOT - alpha) * ease(Math.min(1, (at - bandFrom) / 110));
        var c = 0;
        for (var n = 0; n < clears.length; n += 1) c = Math.max(c, within(at, clears[n][0], clears[n][1], 130));
        alpha = alpha + (1 - alpha) * c;
        if (at < clearTo + 140) alpha = alpha + (1 - alpha) * (at <= clearTo ? 1 : 1 - ease((at - clearTo) / 140));
        stops.push('rgba(255,255,255,' + alpha.toFixed(3) + ') ' + at + 'px');
      }
      var veil = 'linear-gradient(to bottom, ' + stops.join(', ') + ')';
      if (veil !== veilNow) { veilNow = veil; ground.style.setProperty('--veil', veil); }
    };
    var queueVeil = function () {
      if (!veilQueued) { veilQueued = true; window.requestAnimationFrame(layVeil); }
    };
    layVeil();
    window.addEventListener('load', queueVeil);
    window.addEventListener('resize', queueVeil);
    if ('ResizeObserver' in window) new ResizeObserver(queueVeil).observe(document.body);
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
        var match = filter === 'all' || item.getAttribute('data-type') === filter;
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
      item.hidden = !(first === 'all' || item.getAttribute('data-type') === first);
    });
  }

  // Pictures and passages fade in as they come into view.
  var targets = document.querySelectorAll('.collage > li, .drawing-row > li, .photo-row, .plan, .statement-text, .firm-text, .person, .stage-figure, .pull, .services dl > div');
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
