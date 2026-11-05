/* Andrew Artemiev — personal site */
(function () {
  'use strict';

  var reduced   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile  = window.matchMedia('(max-width: 720px)').matches;
  var isNarrow  = window.matchMedia('(max-width: 900px)').matches;
  var fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ── HERO VIDEO — pick source by width, fade in on canplay ───
  var video = document.getElementById('hero-video');
  if (video) {
    try {
      var src = isNarrow ? 'assets/hero-mobile.mp4' : 'assets/hero.mp4';
      var s = document.createElement('source');
      s.src = src;
      s.type = 'video/mp4';
      video.appendChild(s);
      if (!isNarrow) {
        var s2 = document.createElement('source');
        s2.src = 'assets/hero-mobile.mp4';
        s2.type = 'video/mp4';
        video.appendChild(s2);
      }
      video.load();

      var markReady = function () { video.classList.add('is-ready'); };
      video.addEventListener('canplay', markReady, { once: true });
      video.addEventListener('loadeddata', markReady, { once: true });
      setTimeout(markReady, 1600);

      var tryPlay = function () {
        var p = video.play();
        if (p && typeof p.catch === 'function') {
          p.catch(function () { /* ignore — poster stays */ });
        }
      };
      tryPlay();
      var retry = function () { tryPlay(); document.removeEventListener('pointerdown', retry); };
      document.addEventListener('pointerdown', retry, { once: true, passive: true });
    } catch (e) { /* ignore */ }
  }

  // ── Sticky nav state ─────────────────────────────────────
  var nav = document.getElementById('nav');
  var scrolled = null;
  function onScroll() {
    var v = window.scrollY > 20;
    if (v !== scrolled) { nav.classList.toggle('is-scrolled', v); scrolled = v; }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Scroll cue fade-out ─────────────────────────────────
  var cue = document.getElementById('scroll-cue');
  var cueHidden = null;
  function updateCue() {
    if (!cue) return;
    var v = window.scrollY > 60;
    if (v !== cueHidden) { cue.classList.toggle('is-hidden', v); cueHidden = v; }
  }
  window.addEventListener('scroll', updateCue, { passive: true });
  updateCue();

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
        var sp = document.createElement('span');
        sp.style.setProperty('--i', i);
        sp.style.width = (100 / STRIP_COUNT) + '%';
        wrap.appendChild(sp);
      }
      el.appendChild(wrap);
    });
  }

  // ── Scroll-reveal (plain, strips, skill bars) ───────────
  var reveals = document.querySelectorAll('[data-reveal]');
  var forceAll = /(?:^|[?&])show=all(?:&|$)/.test(location.search);
  if (forceAll || reduced) {
    reveals.forEach(function (el) { el.classList.add('is-in'); fillSkillIfNeeded(el, true); });
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          fillSkillIfNeeded(entry.target, false);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); fillSkillIfNeeded(el, true); });
  }

  function fillSkillIfNeeded(el, instant) {
    if (!el.classList || !el.classList.contains('skill')) return;
    var pct = parseFloat(el.getAttribute('data-fill') || '92');
    pct = Math.max(0, Math.min(100, pct));
    var fill = el.querySelector('.skill__fill');
    if (!fill) return;
    if (instant) { fill.style.width = pct + '%'; return; }
    var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
    var delay = Math.max(0, idx) * 90;
    setTimeout(function () { fill.style.width = pct + '%'; }, delay);
  }

  // ── Count-up on numbers ──────────────────────────────────
  var NBSP = ' ';
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

  // ── SMOOTH SCROLL — desktop only, respects reduced-motion ──
  // Lerp between target and current scroll on each frame.
  // Touch devices keep native momentum; reduced-motion opts out entirely.
  (function initSmoothScroll(){
    if (reduced || !fineHover) return;
    if (/(?:^|[?&])nosmooth(?:&|$)/.test(location.search)) return;

    var target  = window.scrollY;
    var current = target;
    var EASE    = 0.085;       // lower = slower, more premium feel
    var running = false;
    var syncing = false;       // ignore our own scrollTo in the scroll listener

    function maxScroll() {
      return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }
    function clamp(v){ return Math.max(0, Math.min(v, maxScroll())); }

    function raf() {
      var diff = target - current;
      if (Math.abs(diff) < 0.4) {
        current = target;
        syncing = true; window.scrollTo(0, current); syncing = false;
        running = false;
        return;
      }
      current += diff * EASE;
      syncing = true; window.scrollTo(0, current); syncing = false;
      running = true;
      requestAnimationFrame(raf);
    }

    function kick(){
      if (!running) { running = true; requestAnimationFrame(raf); }
    }

    window.addEventListener('wheel', function (e) {
      if (menu && !menu.hidden) return;
      if (e.ctrlKey) return;
      e.preventDefault();
      var d = e.deltaY;
      if (e.deltaMode === 1) d *= 16;
      else if (e.deltaMode === 2) d *= window.innerHeight;
      target = clamp(target + d);
      kick();
    }, { passive: false });

    window.addEventListener('keydown', function (e) {
      if (menu && !menu.hidden) return;
      var ae = document.activeElement;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
      var vh = window.innerHeight;
      var map = {
        'PageDown': vh * 0.9,
        'PageUp': -vh * 0.9,
        ' ': e.shiftKey ? -vh * 0.9 : vh * 0.9,
        'ArrowDown': 80,
        'ArrowUp': -80,
        'Home': -maxScroll() - 1,
        'End':  maxScroll() + 1
      };
      if (map[e.key] !== undefined) {
        e.preventDefault();
        target = clamp(target + map[e.key]);
        kick();
      }
    });

    window.addEventListener('scroll', function () {
      if (syncing || running) return;
      target = window.scrollY;
      current = target;
    }, { passive: true });

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      a.addEventListener('click', function (e) {
        var id = href.slice(1);
        var el = id === 'top' ? document.body : document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        var y = id === 'top' ? 0 : (el.getBoundingClientRect().top + window.scrollY - 60);
        target = clamp(y);
        kick();
      });
    });
  })();

  // ── Custom cursor (desktop / fine-pointer only) ──────────
  if (fineHover && !reduced) {
    document.documentElement.classList.add('has-cursor');
    var dot   = document.querySelector('.cursor-dot');
    var trail = document.querySelector('.cursor-trail');
    var tx = -100, ty = -100;
    var dx = tx,   dy = ty;
    var rx = tx,   ry = ty;
    var running2 = false;

    function loop(){
      dx += (tx - dx) * 0.55;
      dy += (ty - dy) * 0.55;
      rx += (tx - rx) * 0.14;
      ry += (ty - ry) * 0.14;
      if (dot)   dot.style.transform   = 'translate3d(' + dx + 'px,' + dy + 'px,0) translate(-50%,-50%)';
      if (trail) trail.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
      running2 = false;
      if (Math.abs(tx - rx) > 0.1 || Math.abs(ty - ry) > 0.1) {
        running2 = true;
        requestAnimationFrame(loop);
      }
    }

    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!running2) { running2 = true; requestAnimationFrame(loop); }
    }, { passive: true });

    window.addEventListener('mouseleave', function () {
      if (dot)   dot.style.opacity = '0';
      if (trail) trail.style.opacity = '0';
    });
    window.addEventListener('mouseenter', function () {
      if (dot)   dot.style.opacity = '';
      if (trail) trail.style.opacity = '';
    });

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
