/* ANDREW ARTEMIEV — site v8 */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav scroll state ---------- */
  const nav = document.querySelector('.nav');
  let lastScrolled = false;
  function updateNav() {
    const y = window.scrollY;
    const hero = document.querySelector('.hero');
    const heroBottom = hero ? hero.offsetHeight : 600;

    // Scrolled state
    const scrolled = y > 20;
    if (scrolled !== lastScrolled) {
      nav.classList.toggle('nav--scrolled', scrolled);
      lastScrolled = scrolled;
    }

    // On-dark state (in hero or channel card)
    const inHero = y < heroBottom - 80;
    nav.classList.toggle('nav--on-dark', inHero);
  }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      if (open) {
        menu.setAttribute('hidden', '');
        document.body.style.overflow = '';
      } else {
        menu.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
      }
      const label = toggle.querySelector('.nav__toggle-label');
      if (label) {
        label.textContent = open ? label.dataset.labelOpen : label.dataset.labelClose;
      }
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('hidden', '');
        document.body.style.overflow = '';
        const label = toggle.querySelector('.nav__toggle-label');
        if (label) label.textContent = label.dataset.labelOpen;
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealTargets = document.querySelectorAll(
    '.about__title, .about__body, .about__ph, .path__title, .timeline__step, .timeline-caption, ' +
    '.work__title, .format, .quote-card, .channel__card, .contact__title, .contact__action, .contrast'
  );
  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-revealed');
          if (e.target.classList.contains('contrast')) {
            // leave observed for contrast replays if needed; we stop observing
          }
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(t => io.observe(t));
  } else {
    revealTargets.forEach(t => t.classList.add('is-revealed'));
  }

  /* ---------- Timeline progress (scroll-linked) ---------- */
  const pathSection = document.querySelector('.path');
  const track = document.querySelector('.timeline-track');
  if (pathSection && track) {
    let ticking = false;
    function updateProgress() {
      const rect = pathSection.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh * 0.4;
      const scrolled = Math.min(Math.max(vh * 0.8 - rect.top, 0), total);
      const p = Math.min(Math.max(scrolled / total, 0), 1);
      track.style.setProperty('--progress', p.toFixed(3));
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateProgress();
  }

  /* ---------- Sales journey progress ---------- */
  const salesSection = document.querySelector('.format--03');
  const salesJourney = document.querySelector('.sales-journey');
  const salesStages = document.querySelectorAll('.sales-journey__stage');
  if (salesSection && salesJourney && salesStages.length) {
    let ticking = false;
    function updateJourney() {
      const rect = salesSection.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height;
      const scrolled = Math.min(Math.max(vh * 0.6 - rect.top, 0), total);
      const p = Math.min(Math.max(scrolled / total, 0), 1);
      salesJourney.style.setProperty('--journey-progress', p.toFixed(3));
      salesStages.forEach((s, i) => {
        const threshold = (i + 1) / salesStages.length - 0.15;
        s.classList.toggle('is-active', p >= threshold);
      });
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateJourney);
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateJourney();
  }

  /* ---------- Smooth scroll for in-page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

})();
