/* Gurry Games — interaction and motion layer.
   Progressive enhancement only: the page is complete without it.
   No dependencies, no build step. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  /* Footer year ---------------------------------------------------------- */
  $$('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* Boot curtain --------------------------------------------------------- */
  (function boot() {
    var curtain = $('[data-boot]');
    if (!curtain) return;

    if (reduceMotion) {
      curtain.remove();
      return;
    }

    var seen = false;
    try {
      seen = window.sessionStorage.getItem('gg-boot') === '1';
      if (!seen) window.sessionStorage.setItem('gg-boot', '1');
    } catch (error) {
      /* Storage can be unavailable in private or restricted contexts. */
    }

    if (seen) {
      curtain.remove();
      return;
    }

    var finished = false;
    var start = window.performance && performance.now ? performance.now() : Date.now();

    function finish() {
      if (finished) return;
      finished = true;
      curtain.classList.add('is-done');
      window.setTimeout(function () {
        if (curtain.parentNode) curtain.remove();
      }, 500);
    }

    function schedule() {
      var elapsed = (window.performance && performance.now ? performance.now() : Date.now()) - start;
      window.setTimeout(finish, Math.max(0, 180 - elapsed));
    }

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }

    /* Hard stop: the curtain never holds the page hostage. */
    window.setTimeout(finish, 1200);
  })();

  /* Header, progress, parallax ------------------------------------------ */
  (function scrollLayer() {
    var head = $('[data-head]');
    var progress = $('[data-progress]');
    var parallax = reduceMotion ? [] : $$('[data-parallax]').map(function (el) {
      return {
        el: el,
        speed: parseFloat(el.getAttribute('data-speed')) || 0.06,
        top: 0,
        height: 0
      };
    });
    var queued = false;
    var dirty = true;

    function measure() {
      var y = window.pageYOffset || document.documentElement.scrollTop;

      for (var i = 0; i < parallax.length; i++) {
        var item = parallax[i];
        item.el.style.transform = 'none';
        var rect = item.el.getBoundingClientRect();
        item.top = rect.top + y;
        item.height = rect.height;
      }

      dirty = false;
    }

    function render() {
      queued = false;

      var y = window.pageYOffset || document.documentElement.scrollTop;
      var viewport = window.innerHeight;

      if (head) {
        head.classList.toggle('is-scrolled', y > 18);
      }

      if (progress) {
        var max = document.documentElement.scrollHeight - viewport;
        progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, Math.max(0, y / max)) : 0) + ')';
      }

      if (!parallax.length) return;
      if (dirty) measure();

      for (var i = 0; i < parallax.length; i++) {
        var item = parallax[i];
        var top = item.top - y;

        if (top + item.height < -180 || top > viewport + 180) continue;

        var offset = (top + item.height / 2 - viewport / 2) * item.speed;
        item.el.style.transform = 'translate3d(0,' + offset.toFixed(2) + 'px,0)';
      }
    }

    function queue() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(render);
    }

    function invalidate() {
      dirty = true;
      queue();
    }

    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', invalidate, { passive: true });
    render();
  })();

  /* Mobile menu ---------------------------------------------------------- */
  (function menuLayer() {
    var toggle = $('[data-menu-toggle]');
    var menu = $('[data-menu]');
    if (!toggle || !menu) return;

    var label = $('.menu-label', toggle);
    var main = $('#main');
    var foot = $('.foot');
    var skip = $('.skip');
    var open = false;
    var lastFocus = null;

    function setOpen(next) {
      if (next === open) return;
      open = next;

      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Close' : 'Menu';

      if (open) {
        lastFocus = document.activeElement;
        menu.removeAttribute('inert');
        menu.setAttribute('aria-hidden', 'false');
        root.classList.add('is-locked');
        if (main) main.setAttribute('inert', '');
        if (foot) foot.setAttribute('inert', '');
        if (skip) {
          skip.setAttribute('inert', '');
          skip.setAttribute('tabindex', '-1');
        }
        menu.classList.add('is-open');

        var first = $('a', menu);
        if (first) first.focus({ preventScroll: true });
      } else {
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        menu.setAttribute('inert', '');
        root.classList.remove('is-locked');
        if (main) main.removeAttribute('inert');
        if (foot) foot.removeAttribute('inert');
        if (skip) {
          skip.removeAttribute('inert');
          skip.removeAttribute('tabindex');
        }

        if (lastFocus && lastFocus.focus) {
          lastFocus.focus({ preventScroll: true });
        }
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(!open);
    });

    $$('[data-menu-link]', menu).forEach(function (link) {
      link.addEventListener('click', function () {
        setOpen(false);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (!open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    });

    var desktop = window.matchMedia('(min-width: 900px)');

    function onDesktop(event) {
      if (event.matches && open) setOpen(false);
    }

    if (desktop.addEventListener) {
      desktop.addEventListener('change', onDesktop);
    } else if (desktop.addListener) {
      desktop.addListener(onDesktop);
    }
  })();

  /* Scroll reveals ------------------------------------------------------- */
  (function reveals() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    items.forEach(function (el) { observer.observe(el); });
  })();

  /* Navigation state ----------------------------------------------------- */
  (function scrollSpy() {
    var links = $$('[data-nav]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var byId = {};
    links.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href.charAt(0) === '#') byId[href.slice(1)] = link;
    });

    var targets = Object.keys(byId).map(function (id) {
      return document.getElementById(id);
    }).filter(Boolean);

    if (!targets.length) return;

    function activate(activeLink) {
      links.forEach(function (link) {
        var isActive = link === activeLink;
        link.classList.toggle('is-active', isActive);
        if (isActive) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) return;

        if (entry.isIntersecting) {
          activate(link);
        } else if (link.classList.contains('is-active')) {
          activate(null);
        }
      });
    }, { rootMargin: '-42% 0px -50% 0px', threshold: 0 });

    targets.forEach(function (target) { observer.observe(target); });
  })();

  /* Card tilt ------------------------------------------------------------ */
  (function tilt() {
    if (!finePointer || reduceMotion) return;

    var invalidators = [];

    function invalidateAll() {
      for (var i = 0; i < invalidators.length; i++) invalidators[i]();
    }

    window.addEventListener('scroll', invalidateAll, { passive: true });
    window.addEventListener('resize', invalidateAll, { passive: true });

    $$('[data-tilt]').forEach(function (card) {
      var rect = null;
      var queued = false;
      var pointerX = 0;
      var pointerY = 0;

      function apply() {
        queued = false;
        if (!rect) return;

        var x = (pointerX - rect.left) / rect.width;
        var y = (pointerY - rect.top) / rect.height;

        card.style.setProperty('--ry', ((x - 0.5) * 7).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - y) * 7).toFixed(2) + 'deg');
        card.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      }

      function queue() {
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(apply);
      }

      invalidators.push(function () { rect = null; });

      card.addEventListener('pointerenter', function () {
        rect = card.getBoundingClientRect();
        card.classList.add('is-tilting');
      });

      card.addEventListener('pointermove', function (event) {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!rect) rect = card.getBoundingClientRect();
        queue();
      });

      card.addEventListener('pointerleave', function () {
        card.classList.remove('is-tilting');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        rect = null;
      });
    });
  })();

  /* Pointer spotlight ---------------------------------------------------- */
  (function spotlight() {
    if (!finePointer || reduceMotion) return;

    var invalidators = [];

    function invalidateAll() {
      for (var i = 0; i < invalidators.length; i++) invalidators[i]();
    }

    window.addEventListener('scroll', invalidateAll, { passive: true });
    window.addEventListener('resize', invalidateAll, { passive: true });

    $$('[data-spotlight]').forEach(function (area) {
      var rect = null;
      var queued = false;
      var pointerX = 0;
      var pointerY = 0;

      function apply() {
        queued = false;
        if (!rect) return;
        area.style.setProperty('--sx', (((pointerX - rect.left) / rect.width) * 100).toFixed(1) + '%');
        area.style.setProperty('--sy', (((pointerY - rect.top) / rect.height) * 100).toFixed(1) + '%');
      }

      function queue() {
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(apply);
      }

      invalidators.push(function () { rect = null; });

      area.addEventListener('pointerenter', function () {
        rect = area.getBoundingClientRect();
      });

      area.addEventListener('pointermove', function (event) {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!rect) rect = area.getBoundingClientRect();
        queue();
      }, { passive: true });

      area.addEventListener('pointerleave', function () {
        rect = null;
      });
    });
  })();

  /* Signal the inline failsafe that the enhancement layer is complete. */
  window.__ggReady = true;
})();