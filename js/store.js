/* Gurry Games storefront behaviour.
   Search, facets and sort progressively enhance server-rendered cards. */
(function () {
  'use strict';

  var doc = document;
  var d = doc.documentElement;
  var body = doc.body;
  var $ = function (sel, root) { return (root || doc).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------- chrome -- */

  var masthead = $('.masthead');
  var toTop = $('.to-top');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (masthead) masthead.classList.toggle('is-scrolled', y > 8);
    if (toTop) toTop.classList.toggle('is-visible', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menu = $('[data-menu]');
  var panel = $('[data-mobile-panel]');
  if (menu && panel) {
    menu.addEventListener('click', function () {
      var open = panel.hidden;
      panel.hidden = !open;
      menu.setAttribute('aria-expanded', String(open));
      if (open) {
        var input = panel.querySelector('[data-search]');
        if (input) window.setTimeout(function () { input.focus(); }, 30);
      }
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        panel.hidden = true;
        menu.setAttribute('aria-expanded', 'false');
      }
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) {
        panel.hidden = true;
        menu.setAttribute('aria-expanded', 'false');
        menu.focus();
      }
    });
  }

  /* -------------------------------------------------------------- search -- */

  var results = $('[data-results]');
  // Game pages have no catalogue, but still need gallery, share and chrome behaviour.

  var indexEl = $('#gg-index');
  var records = [];
  try { records = JSON.parse(indexEl ? indexEl.textContent : '[]'); } catch (err) { records = []; }
  var byId = {};
  records.forEach(function (r) { byId[r.id] = r; });

  var cards = $$('[data-game-id]', results);
  var qInputs = $$('[data-search]');
  var countEl = $('[data-count]');
  var countLabel = $('[data-count-label]');
  var emptyEl = $('[data-empty]');
  var chipsEl = $('[data-active-filters]');
  var badge = $('[data-filter-count]');
  var browse = $('.browse');
  var filters = $('[data-filters]');
  var openBtn = $('[data-filters-open]');
  var closeBtn = $('[data-filters-close]');
  var sortBtns = $$('[data-sort]');
  var viewBtns = $$('[data-view]');

  var FACETS = ['genre', 'tag', 'platform', 'status'];
  var state = { q: '', genre: '', tag: '', platform: '', status: '', sort: 'featured', view: 'grid' };
  var params = new URLSearchParams(window.location.search);
  FACETS.forEach(function (k) { state[k] = params.get(k) || ''; });
  state.q = params.get('q') || '';
  state.sort = params.get('sort') || 'featured';
  state.view = params.get('view') === 'list' ? 'list' : 'grid';

  function norm(text) {
    return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function matches(record) {
    if (!record) return false;
    if (state.genre && record.genres.indexOf(state.genre) === -1) return false;
    if (state.tag && record.tags.indexOf(state.tag) === -1) return false;
    if (state.platform && record.platforms.indexOf(state.platform) === -1) return false;
    if (state.status && record.status !== state.status) return false;
    if (state.q) {
      var hay = norm(record.text + ' ' + record.title);
      var tokens = norm(state.q).split(/\s+/).filter(Boolean);
      for (var i = 0; i < tokens.length; i++) {
        if (hay.indexOf(tokens[i]) === -1) return false;
      }
    }
    return true;
  }

  function sortCards() {
    var sorted = cards.slice().sort(function (a, b) {
      if (state.sort === 'title') {
        return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'));
      }
      if (state.sort === 'recent') {
        return (b.getAttribute('data-added') || '').localeCompare(a.getAttribute('data-added') || '');
      }
      if (state.sort === 'popular') {
        return Number(b.getAttribute('data-popularity')) - Number(a.getAttribute('data-popularity'));
      }
      var f = Number(b.getAttribute('data-featured')) - Number(a.getAttribute('data-featured'));
      if (f) return f;
      return Number(b.getAttribute('data-popularity')) - Number(a.getAttribute('data-popularity'));
    });
    var note = results.querySelector('[data-catalogue-note]');
    sorted.forEach(function (card) { results.insertBefore(card, note); });
  }

  function facetLabels() {
    var labels = {};
    FACETS.forEach(function (kind) {
      labels[kind] = {};
      $$('[data-filter="' + kind + '"]').forEach(function (link) {
        var span = link.querySelector('span');
        var text = link.getAttribute('data-label') || (span ? span.textContent : link.textContent).trim();
        if (text) labels[kind][link.getAttribute('data-value')] = text;
      });
    });
    return labels;
  }
  var LABELS = facetLabels();

  function activeCount() {
    return FACETS.filter(function (k) { return state[k]; }).length + (state.q ? 1 : 0);
  }

  function renderChips() {
    if (!chipsEl) return;
    chipsEl.innerHTML = '';
    var any = false;
    FACETS.forEach(function (kind) {
      if (!state[kind]) return;
      any = true;
      var chip = doc.createElement('span');
      chip.className = 'active-filter';
      var label = (LABELS[kind] && LABELS[kind][state[kind]]) || state[kind];
      chip.appendChild(doc.createTextNode(label));
      var btn = doc.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Remove ' + label + ' filter');
      btn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-close"/></svg>';
      btn.addEventListener('click', function () {
        state[kind] = '';
        apply();
      });
      chip.appendChild(btn);
      chipsEl.appendChild(chip);
    });
    if (state.q) {
      any = true;
      var qchip = doc.createElement('span');
      qchip.className = 'active-filter';
      qchip.appendChild(doc.createTextNode('“' + state.q + '”'));
      var qbtn = doc.createElement('button');
      qbtn.type = 'button';
      qbtn.setAttribute('aria-label', 'Clear search');
      qbtn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-close"/></svg>';
      qbtn.addEventListener('click', function () {
        state.q = '';
        qInputs.forEach(function (i) { i.value = ''; });
        apply();
      });
      qchip.appendChild(qbtn);
      chipsEl.appendChild(qchip);
    }
    chipsEl.hidden = !any;
    if (badge) {
      var n = activeCount();
      badge.textContent = String(n);
      badge.hidden = n === 0;
    }
  }

  function writeUrl() {
    if (!results) return;
    var p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    FACETS.forEach(function (k) { if (state[k]) p.set(k, state[k]); });
    if (state.sort && state.sort !== 'featured') p.set('sort', state.sort);
    if (state.view !== 'grid') p.set('view', state.view);
    var qs = p.toString();
    var url = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
    try { history.replaceState(null, '', url); } catch (err) { /* file:// */ }
  }

  function apply(scroll) {
    if (!results) return;
    var visible = 0;
    cards.forEach(function (card) {
      var rec = byId[card.getAttribute('data-game-id')];
      var show = matches(rec);
      card.hidden = !show;
      if (show) visible++;
    });
    sortCards();
    if (countEl) countEl.textContent = visible + (visible === 1 ? ' game' : ' games');
    if (countLabel) countLabel.textContent = state.q || activeCount() ? 'matching' : 'on the shelf';
    if (emptyEl) emptyEl.hidden = visible !== 0;
    var note = results.querySelector('[data-catalogue-note]');
    if (note) note.hidden = activeCount() > 0;
    renderChips();
    syncFilterLinks();
    writeUrl();
    if (scroll) {
      var target = $('#catalogue');
      if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function syncFilterLinks() {
    if (!results) return;
    $$('[data-filter]').forEach(function (link) {
      var kind = link.getAttribute('data-filter');
      var value = link.getAttribute('data-value');
      if (FACETS.indexOf(kind) === -1) return;
      link.classList.toggle('is-active', state[kind] === value);
      if (kind === 'genre' && link.classList.contains('genre-tile')) {
        link.setAttribute('aria-current', state.genre === value ? 'page' : 'false');
      }
    });
    sortBtns.forEach(function (btn) {
      var active = btn.getAttribute('data-sort') === state.sort;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    viewBtns.forEach(function (btn) {
      var active = btn.getAttribute('data-view') === state.view;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    if (results) {
      results.classList.toggle('results--grid', state.view === 'grid');
      results.classList.toggle('results--list', state.view === 'list');
    }
  }

  if (!results) {
    // On game pages the header form submits natively.
  } else {
  qInputs.forEach(function (input) {
    input.value = state.q;
    var timer;
    input.addEventListener('input', function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        state.q = input.value.trim();
        qInputs.forEach(function (other) { if (other !== input) other.value = input.value; });
        apply(false);
      }, 110);
    });
  });

  $$('form[data-search-form], .catalogue-search, .search--mobile').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (!results) return;
      e.preventDefault();
      var input = form.querySelector('[data-search]');
      if (input) {
        state.q = input.value.trim();
        qInputs.forEach(function (other) { other.value = input.value; });
      }
      apply(true);
    });
  });

  doc.addEventListener('click', function (e) {
    if (!results) return;
    var link = e.target.closest('[data-filter]');
    if (!link) return;
    var kind = link.getAttribute('data-filter');
    if (FACETS.indexOf(kind) === -1) return;
    e.preventDefault();
    var value = link.getAttribute('data-value') || '';
    state[kind] = state[kind] === value ? '' : value;
    apply(true);
    if (filters && browse && browse.classList.contains('is-filters-open')) closeFilters();
  });
  }

  $$('[data-clear="all"]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      state.q = '';
      FACETS.forEach(function (k) { state[k] = ''; });
      state.sort = 'featured';
      qInputs.forEach(function (i) { i.value = ''; });
      apply(true);
    });
  });

  sortBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.sort = btn.getAttribute('data-sort');
      apply(false);
    });
  });

  viewBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.view = btn.getAttribute('data-view');
      apply(false);
    });
  });

  /* ------------------------------------------------------------- filters -- */

  function openFilters() {
    if (!browse) return;
    browse.classList.add('is-filters-open');
    body.classList.add('is-locked');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    var close = $('[data-filters-close]');
    if (close) window.setTimeout(function () { close.focus(); }, 60);
  }
  function closeFilters() {
    if (!browse) return;
    browse.classList.remove('is-filters-open');
    body.classList.remove('is-locked');
    if (openBtn) {
      openBtn.setAttribute('aria-expanded', 'false');
      openBtn.focus();
    }
  }
  if (openBtn) openBtn.addEventListener('click', openFilters);
  if (closeBtn) closeBtn.addEventListener('click', closeFilters);
  doc.addEventListener('click', function (e) {
    if (!browse || !browse.classList.contains('is-filters-open')) return;
    if (e.target.closest('.filters') || e.target.closest('[data-filters-open]')) return;
    closeFilters();
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && browse && browse.classList.contains('is-filters-open')) closeFilters();
  });

  window.addEventListener('popstate', function () {
    var p = new URLSearchParams(window.location.search);
    state.q = p.get('q') || '';
    FACETS.forEach(function (k) { state[k] = p.get(k) || ''; });
    state.sort = p.get('sort') || 'featured';
    state.view = p.get('view') === 'list' ? 'list' : 'grid';
    qInputs.forEach(function (i) { i.value = state.q; });
    apply(false);
  });

  /* ------------------------------------------------------------- gallery -- */

  var stage = $('[data-gallery-stage]');
  var stageWrap = $('.game-gallery__stage');
  var shotCount = $('[data-gallery-count]');
  var thumbs = $$('[data-gallery-thumb]');
  var shots = thumbs.map(function (b) {
    return {
      src: b.getAttribute('data-src'),
      caption: b.getAttribute('data-caption') || '',
      alt: b.getAttribute('data-alt') || ''
    };
  });
  var shotIndex = 0;

  function showShot(i, updateThumb) {
    if (!stage || !shots.length) return;
    shotIndex = (i + shots.length) % shots.length;
    stage.src = shots[shotIndex].src;
    stage.alt = shots[shotIndex].alt;
    var cap = $('[data-gallery-caption]');
    if (cap) cap.textContent = shots[shotIndex].caption;
    if (shotCount) shotCount.textContent = (shotIndex + 1) + ' / ' + shots.length;
    if (updateThumb !== false) {
      thumbs.forEach(function (b, n) {
        b.classList.toggle('is-active', n === shotIndex);
        b.setAttribute('aria-pressed', String(n === shotIndex));
      });
    }
  }
  thumbs.forEach(function (btn, i) {
    btn.addEventListener('click', function () { showShot(i); });
  });
  var prev = $('[data-gallery-prev]');
  var next = $('[data-gallery-next]');
  if (prev) prev.addEventListener('click', function () { showShot(shotIndex - 1); });
  if (next) next.addEventListener('click', function () { showShot(shotIndex + 1); });
  if (stageWrap) {
    stageWrap.setAttribute('tabindex', '0');
    stageWrap.setAttribute('role', 'button');
    stageWrap.setAttribute('aria-label', 'Open screenshot viewer');
    stageWrap.addEventListener('click', function () { openLightbox(shotIndex); });
    stageWrap.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(shotIndex); }
    });
  }

  var lightbox = $('[data-lightbox]');
  var lbImg = $('[data-lightbox-img]');
  var lbCap = $('[data-lightbox-caption]');
  var lbIndex = 0;
  function openLightbox(i) {
    if (!lightbox || !shots.length) return;
    lbIndex = i;
    if (lbImg) { lbImg.src = shots[i].src; lbImg.alt = shots[i].alt; }
    if (lbCap) lbCap.textContent = shots[i].caption;
    if (typeof lightbox.showModal === 'function') lightbox.showModal();
    else lightbox.setAttribute('open', '');
    body.classList.add('is-locked');
  }
  function lbGo(delta) {
    lbIndex = (lbIndex + delta + shots.length) % shots.length;
    if (lbImg) { lbImg.src = shots[lbIndex].src; lbImg.alt = shots[lbIndex].alt; }
    if (lbCap) lbCap.textContent = shots[lbIndex].caption;
  }
  if (lightbox) {
    var lbClose = $('[data-lightbox-close]');
    var lbPrev = $('[data-lightbox-prev]');
    var lbNext = $('[data-lightbox-next]');
    if (lbClose) lbClose.addEventListener('click', function () { lightbox.close(); });
    if (lbPrev) lbPrev.addEventListener('click', function () { lbGo(-1); });
    if (lbNext) lbNext.addEventListener('click', function () { lbGo(1); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener('close', function () { body.classList.remove('is-locked'); });
    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); lbGo(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); lbGo(1); }
    });
  }

  /* --------------------------------------------------------------- share -- */

  $$('[data-share]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = window.location.href.split('#')[0];
      var title = doc.title.replace(' — Gurry Games', '');
      if (navigator.share) {
        navigator.share({ title: title, url: url }).catch(function () {});
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { toast('Link copied'); }).catch(function () { toast(url); });
      } else {
        toast(url);
      }
    });
  });

  var toastTimer;
  function toast(message) {
    var el = $('.toast');
    if (!el) {
      el = doc.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      doc.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { el.classList.remove('is-visible'); }, 2200);
  }

  /* ------------------------------------------------------------ shortcut -- */

  doc.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (doc.activeElement && doc.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    var input = qInputs.filter(function (i) { return i.offsetParent !== null; })[0];
    if (input) { e.preventDefault(); input.focus(); input.select(); }
  });

  /* --------------------------------------------------------------- start -- */

  if (state.q) qInputs.forEach(function (i) { i.value = state.q; });
  apply(Boolean(state.q || activeCount()) && window.location.hash === '#catalogue');
})();