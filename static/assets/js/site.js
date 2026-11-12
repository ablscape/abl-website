// Two small behaviors. The site reads and works without them.
(function () {
  'use strict';

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
      timer = window.setInterval(function () { show(index + 1); }, 11000);
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

  // Work: one row of buttons narrows the grid.
  var grid = document.querySelector('[data-project-grid]');
  var bar = document.querySelector('[data-filters]');
  if (grid && bar) {
    var buttons = bar.querySelectorAll('[data-filter]');
    var items = grid.querySelectorAll('[data-type]');
    var apply = function (filter) {
      Array.prototype.forEach.call(items, function (item) {
        var match = filter === 'all' ||
          (filter === 'featured' ? item.getAttribute('data-featured') === 'true' : item.getAttribute('data-type') === filter);
        item.hidden = !match;
      });
      Array.prototype.forEach.call(buttons, function (button) {
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
    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener('click', function () {
        var filter = button.getAttribute('data-filter');
        apply(filter);
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '#' + filter.toLowerCase());
        }
      });
    });
    bar.hidden = false;
    apply(fromAddress());
  }
})();
