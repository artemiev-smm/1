/* Andrew Artemiev — personal site */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 720px)').matches;
  var fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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

  // ── STRIP REVEAL — build strip overlays on tagged elements ──
  var stripTargets = document.querySelectorAll('[data-reveal="strips"]');
  var STRIP_COUNT = 5;
  if (!reduced) {
    stripTargets.forEach(function (el) {
      el.classList.add('strip-wrap');
      var wrap = document.createElement('div');
      wrap.className = 'strips';
      for (var i = 0; i < STRIP_COUNT; i++) {
        var s = document.createElement('span');
        s.style.setProperty('--i', i);
        s.style.width = (100 / STRIP_COUNT) + '%';
        wrap.appendChild(s);
      }
      el.appendChild(wrap);
    });
  }

  // ── Scroll-reveal (both plain and strips) ────────────────
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
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  // ── Count-up on numbers ──────────────────────────────────
  var NBSP = ' ';
  function fmt(v, d) {
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
    el.textContent = fmt(target, decimals);
  }
  function runCount(el) {
    if (el.dataset.done) return;
    if (reduced || isMobile) { setFinal(el); return; }
    el.dataset.done = '1';
    var target = parseFloat(el.getAttribute('data-count-to')) || 0;
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var duration = 1400, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      el.textContent = fmt(target * easeOut(t), decimals);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target, decimals);
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

  // ── Custom cursor (desktop / fine-pointer only) ──────────
  if (fineHover && !reduced) {
    document.documentElement.classList.add('has-cursor');
    var dot   = document.querySelector('.cursor-dot');
    var trail = document.querySelector('.cursor-trail');
    var tx = -100, ty = -100;   // target
    var dx = tx,   dy = ty;     // dot (follows fast)
    var rx = tx,   ry = ty;     // trail (follows slower)
    var running = false;

    function loop(){
      dx += (tx - dx) * 0.55;
      dy += (ty - dy) * 0.55;
      rx += (tx - rx) * 0.14;
      ry += (ty - ry) * 0.14;
      if (dot)   dot.style.transform   = 'translate3d(' + dx + 'px,' + dy + 'px,0) translate(-50%,-50%)';
      if (trail) trail.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
      running = false;
      // Continue while target is still being chased
      if (Math.abs(tx - rx) > 0.1 || Math.abs(ty - ry) > 0.1) {
        running = true;
        requestAnimationFrame(loop);
      }
    }

    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });

    window.addEventListener('mouseleave', function () {
      if (dot)   dot.style.opacity = '0';
      if (trail) trail.style.opacity = '0';
    });
    window.addEventListener('mouseenter', function () {
      if (dot)   dot.style.opacity = '';
      if (trail) trail.style.opacity = '';
    });

    // Hover state on interactive elements — trail expands, dot fades
    var hoverSel = 'a, button, [role="button"], input, textarea, select, label';
    document.querySelectorAll(hoverSel).forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        document.documentElement.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', function () {
        document.documentElement.classList.remove('cursor-hover');
      });
    });
  }
})();
