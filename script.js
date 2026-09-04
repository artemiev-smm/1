/* Andrew Artemiev — personal site
   Calm confidence. Subtle motion. Readability > effects.
*/
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 720px)').matches;

  // ---- Year in footer ----
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---- Sticky nav state ----
  var nav = document.getElementById('nav');
  var lastScrolled = null;
  function onScroll() {
    var scrolled = window.scrollY > 20;
    if (scrolled !== lastScrolled) {
      nav.classList.toggle('is-scrolled', scrolled);
      lastScrolled = scrolled;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Mobile menu ----
  var toggle = document.querySelector('.nav__toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  function setMenuOpen(open) {
    if (!toggle || !mobileMenu) return;
    toggle.setAttribute('aria-expanded', String(open));
    mobileMenu.hidden = !open;
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  if (toggle) toggle.addEventListener('click', function () {
    setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  if (mobileMenu) mobileMenu.addEventListener('click', function (e) {
    if (e.target && e.target.tagName === 'A') setMenuOpen(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenuOpen(false); });

  // ---- Reveal on scroll ----
  var reveals = document.querySelectorAll('[data-reveal]');
  var forceAll = /(?:^|[?&])show=all(?:&|$)/.test(location.search);
  if (forceAll) {
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

  // ---- Count-up on numbers block (desktop only) ----
  var counters = document.querySelectorAll('[data-count-to]');
  var NBSP = ' '; // non-breaking space for Russian thousand separator
  function formatNumber(value, decimals) {
    var fixed = value.toFixed(decimals);
    var parts = fixed.split('.');
    var intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
    return parts.length > 1 ? intPart + ',' + parts[1] : intPart;
  }
  function easeOut(t){ return 1 - Math.pow(1 - t, 3); }
  function setFinal(el) {
    var target = parseFloat(el.getAttribute('data-count-to')) || 0;
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    el.textContent = formatNumber(target, decimals);
    el.dataset.done = '1';
  }
  function runCount(el) {
    if (el.dataset.done === '1') return;
    if (reduced || isMobile) { setFinal(el); return; }
    el.dataset.done = '1';
    var target = parseFloat(el.getAttribute('data-count-to')) || 0;
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var duration = 1500;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      var v = target * easeOut(t);
      el.textContent = formatNumber(v, decimals);
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
        if (entry.isIntersecting) {
          runCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(setFinal);
  }

  // ---- Very subtle hero glow drift on scroll (desktop only) ----
  var glow = document.querySelector('.hero__glow');
  if (glow && !reduced && !isMobile) {
    var ticking = false;
    function update() {
      var y = window.scrollY;
      var t = Math.max(-40, Math.min(40, y * 0.06));
      glow.style.setProperty('transform', 'translate3d(0,' + t.toFixed(1) + 'px,0)');
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }
})();
