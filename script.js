/* Andrew Artemiev — personal site
   Editorial minimal · Subtle motion · Readability first
*/
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 720px)').matches;

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ── Sticky nav state ─────────────────────────────────────
  var nav = document.getElementById('nav');
  var scrolled = null;
  function onScroll() {
    var v = window.scrollY > 20;
    if (v !== scrolled) { nav.classList.toggle('is-scrolled', v); scrolled = v; }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Mobile menu ──────────────────────────────────────────
  var toggle = document.querySelector('.nav__toggle');
  var menu   = document.getElementById('mobile-menu');
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  if (toggle) toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  if (menu) menu.addEventListener('click', function (e) {
    if (e.target && e.target.tagName === 'A') setMenu(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // ── Scroll-reveal ────────────────────────────────────────
  var reveals = document.querySelectorAll('[data-reveal]');
  var forceAll = /(?:^|[?&])show=all(?:&|$)/.test(location.search);
  if (forceAll || reduced) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  // ── Count-up on numbers block ────────────────────────────
  // Uses U+00A0 (non-breaking) as thousand separator so "1 000 000" never wraps
  var NBSP = ' ';
  function formatNumber(v, d) {
    var s = v.toFixed(d);
    var p = s.split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
    return p.length > 1 ? p[0] + ',' + p[1] : p[0];
  }
  function easeOut(t){ return 1 - Math.pow(1 - t, 3); }
  var counters = document.querySelectorAll('[data-count-to]');
  function setFinal(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var target = parseFloat(el.getAttribute('data-count-to')) || 0;
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    el.textContent = formatNumber(target, decimals);
  }
  function runCount(el) {
    if (el.dataset.done) return;
    if (reduced || isMobile) { setFinal(el); return; }
    el.dataset.done = '1';
    var target = parseFloat(el.getAttribute('data-count-to')) || 0;
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      el.textContent = formatNumber(target * easeOut(t), decimals);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = formatNumber(target, decimals);
    }
    requestAnimationFrame(step);
  }
  if (isMobile || reduced) {
    counters.forEach(setFinal);
  } else if (forceAll) {
    counters.forEach(runCount);
  } else if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(setFinal);
  }
})();
