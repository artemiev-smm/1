/* Andrew Artemiev — personal site
   Minimal, subtle motion. Calm confidence.
*/
(function () {
  'use strict';

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
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      setMenuOpen(open);
    });
  }
  if (mobileMenu) {
    mobileMenu.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.tagName === 'A') setMenuOpen(false);
    });
  }
  // Close on ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenuOpen(false);
  });

  // ---- Reveal on scroll ----
  var reveals = document.querySelectorAll('[data-reveal], .hero__title-line');

  if ('IntersectionObserver' in window) {
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

  // ---- Very subtle parallax on hero photo (respects reduced-motion) ----
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var heroPhoto = document.querySelector('.hero__photo .photo-frame img, .hero__photo .photo-frame svg');

  if (!reduced && heroPhoto) {
    var ticking = false;
    function updateParallax() {
      var y = window.scrollY;
      var max = 400;
      var offset = Math.max(-24, Math.min(24, -(y / max) * 40));
      heroPhoto.style.transform = 'translate3d(0,' + offset.toFixed(2) + 'px,0) scale(1.02)';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }
})();
