/* Andrew Artemiev — personal site
   Calm confidence. Subtle motion.
*/
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  var reveals = document.querySelectorAll('[data-reveal], .hero__title-line');
  var forceAll = /(?:^|[?&])show=all(?:&|$)/.test(location.search);
  if (forceAll) {
    reveals.forEach(function(el){ el.classList.add('is-in'); });
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

  // ---- Portrait 3D tilt on mouse move (hero only) ----
  var portrait = document.getElementById('portrait');
  if (portrait && !reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var stage = portrait.querySelector('.portrait__stage');
    var frame = portrait.querySelector('.portrait__frame');
    var raf = 0;
    var targetX = 0, targetY = 0, curX = 0, curY = 0;

    function loop() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      if (frame) {
        frame.style.transform = 'rotateX(' + curY.toFixed(2) + 'deg) rotateY(' + curX.toFixed(2) + 'deg)';
      }
      raf = requestAnimationFrame(loop);
    }
    function onMove(e) {
      var r = portrait.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width  - 0.5;
      var py = (e.clientY - r.top)  / r.height - 0.5;
      targetX = px * 6;   // rotateY
      targetY = -py * 6;  // rotateX
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function onLeave() {
      targetX = 0; targetY = 0;
      setTimeout(function(){
        if (Math.abs(curX) < 0.05 && Math.abs(curY) < 0.05) {
          cancelAnimationFrame(raf); raf = 0;
          if (frame) frame.style.transform = '';
        }
      }, 500);
    }
    portrait.addEventListener('mousemove', onMove);
    portrait.addEventListener('mouseleave', onLeave);
  }

  // ---- Hero glow parallax on scroll (very subtle) ----
  var glow = document.querySelector('.hero__glow');
  if (glow && !reduced) {
    var ticking = false;
    function update() {
      var y = window.scrollY;
      var t = Math.max(-60, Math.min(60, y * 0.08));
      glow.style.setProperty('transform', 'translate3d(0,' + t.toFixed(1) + 'px,0)');
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }
})();
