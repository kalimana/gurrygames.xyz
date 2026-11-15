/* Gurry Games storefront behaviour: chrome, gallery, lightbox, share. */
(function () {
  'use strict';

  var doc = document;
  var body = doc.body;
  var $ = function (sel, root) { return (root || doc).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); };

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

  /* ------------------------------------------------------------ lightbox -- */

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
      var title = doc.title.split(' | ')[0];
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
})();