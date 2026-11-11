/* GurryGames v2 — shared page behaviour. Classic deferred script, no dependencies. */
(function () {
  'use strict';

  function initNav() {
    const toggle = document.getElementById('navToggle');
    if (!toggle) return;

    const body = document.body;
    const links = document.querySelectorAll('.nav-links a');
    const inner = document.querySelector('.nav-inner');
    const desktop = window.matchMedia('(min-width: 760px)');
    let open = false;

    function render(state) {
      open = state;
      if (body) body.classList.toggle('nav-open', state);
      toggle.classList.toggle('is-open', state);
      toggle.setAttribute('aria-expanded', state ? 'true' : 'false');
      toggle.setAttribute('aria-label', state ? 'Close menu' : 'Open menu');
    }

    function close(refocus) {
      if (!open) return;
      render(false);
      if (refocus) toggle.focus();
    }

    toggle.addEventListener('click', () => render(!open));

    // Esc must work from anywhere, including focus inside the panel; focus returns to the toggle.
    document.addEventListener('keydown', (event) => {
      if (open && event.key === 'Escape') close(true);
    });

    links.forEach((link) => link.addEventListener('click', () => close(true)));

    if (inner) {
      document.addEventListener('click', (event) => {
        if (open && !inner.contains(event.target)) close(false);
      });
    }

    // Crossing into the desktop layout hides the panel, so force the state closed to match.
    const onBreakpoint = (event) => { if (event.matches) close(false); };
    if (typeof desktop.addEventListener === 'function') desktop.addEventListener('change', onBreakpoint);
    else if (typeof desktop.addListener === 'function') desktop.addListener(onBreakpoint);

    render(false);
  }

  function initSticky() {
    const nav = document.getElementById('siteNav');
    if (!nav) return;

    let queued = false;

    function apply() {
      queued = false;
      nav.classList.toggle('is-stuck', window.scrollY > 24);
    }

    // Coalesce scroll bursts into one class write per animation frame.
    function onScroll() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(apply);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    apply();
  }

  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    // Position among reveal siblings drives the cascade; authored delays are preserved.
    const seen = new WeakMap();
    items.forEach((el) => {
      const parent = el.parentNode;
      if (!parent) return;
      const index = seen.get(parent) || 0;
      seen.set(parent, index + 1);
      if (!el.style.getPropertyValue('--reveal-delay')) {
        el.style.setProperty('--reveal-delay', `${Math.min(index * 60, 300)}ms`);
      }
    });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!('IntersectionObserver' in window) || reduce.matches) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    items.forEach((el) => observer.observe(el));
  }

  function initYear() {
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function initExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const rel = link.getAttribute('rel');
      if (!rel || !rel.trim()) link.setAttribute('rel', 'noopener');
    });
  }

  function init() {
    initNav();
    initSticky();
    initReveal();
    initYear();
    initExternalLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();