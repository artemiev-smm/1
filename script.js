/* ============================================================
   Andrew Artemiev — Site Script  v7
   Native scroll + IntersectionObserver reveals + scroll-linked progress.
   ============================================================ */
;(function(){
  'use strict';

  const html = document.documentElement;
  html.classList.add('js');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Hero video ── */
  const heroVideo = document.querySelector('.hero__video');
  if(heroVideo){
    let attempts = 0;
    const tryPlay = ()=>{
      const p = heroVideo.play();
      if(p && typeof p.catch === 'function'){
        p.catch(()=>{
          if(++attempts < 4) setTimeout(tryPlay, 700 * attempts);
        });
      }
    };
    heroVideo.addEventListener('loadeddata', tryPlay, {once:true});
    if(heroVideo.readyState >= 2) tryPlay();
    document.addEventListener('visibilitychange', ()=>{
      if(!document.hidden && heroVideo.paused) tryPlay();
    });
  }

  /* ── Sticky nav ── */
  const nav = document.querySelector('.nav');
  if(nav){
    let lastY = 0, ticking = false;
    const onScroll = ()=>{
      lastY = window.scrollY;
      if(!ticking){
        requestAnimationFrame(()=>{
          nav.classList.toggle('is-scrolled', lastY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  /* ── Hero-in-view ── */
  const hero = document.querySelector('.hero');
  if(hero && 'IntersectionObserver' in window){
    const heroObs = new IntersectionObserver((entries)=>{
      entries.forEach(e =>{
        document.body.classList.toggle('hero-in-view', e.isIntersecting && e.intersectionRatio > 0.15);
      });
    }, { threshold: [0, 0.15, 0.3] });
    heroObs.observe(hero);
  }

  /* ── Mobile menu ── */
  const toggle = document.querySelector('.nav__toggle');
  const menu   = document.getElementById('mobile-menu');
  if(toggle && menu){
    const toggleLabel = toggle.querySelector('.nav__toggle-label');
    const openLabel  = toggleLabel ? toggleLabel.getAttribute('data-label-open')  || 'Меню'   : null;
    const closeLabel = toggleLabel ? toggleLabel.getAttribute('data-label-close') || 'Закрыть' : null;
    const closeMenu = ()=>{
      toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-label','Меню');
      menu.hidden = true;
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
      if(toggleLabel) toggleLabel.textContent = openLabel;
    };
    const openMenu = ()=>{
      toggle.setAttribute('aria-expanded','true');
      toggle.setAttribute('aria-label','Закрыть меню');
      menu.hidden = false;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
      if(toggleLabel) toggleLabel.textContent = closeLabel;
    };
    toggle.addEventListener('click', ()=>{
      (toggle.getAttribute('aria-expanded') === 'true') ? closeMenu() : openMenu();
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e=>{
      if(e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu();
    });
  }

  /* ── Hero split title ── */
  const splitTarget = document.querySelector('[data-split]');
  if(splitTarget && !prefersReduced){
    let i = 0;
    splitTarget.querySelectorAll('.hero__title-line').forEach(line=>{
      const original = Array.from(line.childNodes);
      const wrap = [];
      original.forEach(node=>{
        if(node.nodeType === 3){
          const parts = node.textContent.split(/(\s+)/);
          parts.forEach(p=>{
            if(/^\s*$/.test(p)){
              wrap.push(document.createTextNode(p));
            } else if(p.length){
              const span = document.createElement('span');
              span.className = 'word';
              span.style.setProperty('--i', i++);
              span.textContent = p;
              wrap.push(span);
            }
          });
        } else {
          const span = document.createElement('span');
          span.className = 'word';
          span.style.setProperty('--i', i++);
          span.appendChild(node.cloneNode(true));
          wrap.push(span);
        }
      });
      line.innerHTML = '';
      wrap.forEach(n => line.appendChild(n));
    });
    const show = ()=> splitTarget.classList.add('is-in');
    requestAnimationFrame(()=> requestAnimationFrame(show));
    setTimeout(show, 300);
  } else if(splitTarget){
    splitTarget.classList.add('is-in');
  }

  /* ── Safety fallback ── */
  setTimeout(()=>{
    document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(el => el.classList.add('is-in'));
  }, 4500);

  /* ── Reveal targets ── */
  const revealTargets = [
    '.hero__sub',
    '.about__title', '.about__body', '.about__gallery',
    '.path__head',
    '.work__head', '.format',
    '.quote-card',
    '.channel__text', '.channel__btn',
    '.contact__title', '.tg-float'
  ];
  revealTargets.forEach(sel=>{
    document.querySelectorAll(sel).forEach(el => el.setAttribute('data-reveal',''));
  });
  requestAnimationFrame(()=> html.classList.add('reveals-armed'));

  if('IntersectionObserver' in window){
    const revealObs = new IntersectionObserver((entries)=>{
      entries.forEach(e =>{
        if(e.isIntersecting){
          e.target.classList.add('is-in');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

    /* Timeline cards photo-fall */
    const timeline = document.querySelector('.timeline');
    if(timeline){
      const timelineObs = new IntersectionObserver((entries)=>{
        entries.forEach(e =>{
          if(e.isIntersecting){
            timeline.classList.add('is-animating');
            timelineObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.2 });
      timelineObs.observe(timeline);
    }

    /* Contact line */
    const contactLine = document.querySelector('.contact__line');
    if(contactLine){
      const lineObs = new IntersectionObserver((entries)=>{
        entries.forEach(e =>{
          if(e.isIntersecting){
            e.target.classList.add('is-in');
            lineObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.3 });
      lineObs.observe(contactLine);
    }
  } else {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-in'));
    const t = document.querySelector('.timeline');
    if(t) t.classList.add('is-animating');
    const cl = document.querySelector('.contact__line');
    if(cl) cl.classList.add('is-in');
  }

  /* ── Scroll cue fade ── */
  const scrollCue = document.querySelector('.scroll-cue');
  if(scrollCue){
    const cueCheck = ()=> scrollCue.classList.toggle('is-hidden', window.scrollY > 120);
    window.addEventListener('scroll', cueCheck, {passive:true});
    cueCheck();
  }

  /* ── Section-words parallax ── */
  if(!prefersReduced && window.matchMedia('(min-width: 900px)').matches){
    const words = document.querySelectorAll('.section__word');
    if(words.length){
      let ticking = false;
      const onScroll = ()=>{
        if(ticking) return;
        ticking = true;
        requestAnimationFrame(()=>{
          const vh = window.innerHeight;
          words.forEach(w=>{
            const r = w.getBoundingClientRect();
            if(r.bottom < -200 || r.top > vh + 200) return;
            const center = r.top + r.height/2;
            const offset = (center - vh/2) * 0.06;
            w.style.transform = `translate3d(0, ${offset * -1}px, 0)`;
          });
          ticking = false;
        });
      };
      window.addEventListener('scroll', onScroll, {passive:true});
      onScroll();
    }
  }

  /* ── Smooth anchor scroll with nav offset ── */
  const navH = ()=> (nav ? nav.getBoundingClientRect().height : 0) + 8;
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const id = a.getAttribute('href').slice(1);
      if(!id) return;
      const target = document.getElementById(id);
      if(!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - navH();
      window.scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  /* ============================================================
     SCROLL-LINKED TIMELINE PROGRESS
     As user scrolls through timeline, orange dot moves 15→16→17→18.
     No wheel-hijack: this ONLY reads scrollY, never preventDefault.
     ============================================================ */
  const trackEl = document.querySelector('.timeline-track');
  const pathSection = document.querySelector('.path');
  if(trackEl && pathSection){
    const steps = Array.from(document.querySelectorAll('.timeline__step'));
    let raf = null;
    const update = ()=>{
      raf = null;
      if(!steps.length) return;
      const rect = pathSection.getBoundingClientRect();
      const vh = window.innerHeight;
      // Map: when the timeline enters bottom of viewport -> progress starts
      // When the last card's center passes top-middle -> progress is 100%.
      const firstCard = steps[0].querySelector('.timeline__card');
      const lastCard  = steps[steps.length-1].querySelector('.timeline__card');
      if(!firstCard || !lastCard) return;
      const startY = firstCard.getBoundingClientRect().top - vh * 0.7;
      const endY   = lastCard.getBoundingClientRect().bottom - vh * 0.7;
      let p;
      if(startY >= 0){
        p = 0;
      } else if(endY <= 0){
        p = 1;
      } else {
        // total travel distance in px
        const travel = (endY - startY);
        // how much we've travelled from start
        const travelled = -startY;
        p = travel > 0 ? travelled / travel : 0;
      }
      p = Math.max(0, Math.min(1, p));
      trackEl.style.setProperty('--progress', String(p));
    };
    const onScroll = ()=>{
      if(raf) return;
      raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ============================================================
     SALES JOURNEY: synchronized dot + stage activation
     Smoothly moves dot through 3 stages. Each stage activates
     ONLY when the dot is directly under it.
     ============================================================ */
  const journey = document.querySelector('.sales-journey');
  if(journey && !prefersReduced){
    const stages = Array.from(journey.querySelectorAll('.sales-journey__stage'));
    const CYCLE = 6000; // total cycle: travel 5s + pause 1s
    const TRAVEL_MS = 4500;
    let startTs = null;
    let rafId = null;
    let running = false;
    const setProgress = (p)=>{
      journey.style.setProperty('--journey-progress', String(p));
      // Activate stage based on dot position
      // Stage positions: 0 -> 0, 1 -> 0.5, 2 -> 1
      let activeIdx = 0;
      if(p >= 0.83){ activeIdx = 2; }        // dot visibly under third stage
      else if(p >= 0.33){ activeIdx = 1; }   // dot visibly under middle stage
      else { activeIdx = 0; }
      stages.forEach((s, i) => s.classList.toggle('is-active', i === activeIdx));
    };
    const tick = (ts)=>{
      if(startTs === null) startTs = ts;
      const elapsed = (ts - startTs) % CYCLE;
      let p;
      if(elapsed < TRAVEL_MS){
        // Smooth easeInOut over travel phase
        const t = elapsed / TRAVEL_MS;
        p = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
      } else {
        p = 1; // hold at end
      }
      setProgress(p);
      rafId = requestAnimationFrame(tick);
    };
    const start = ()=>{
      if(running) return;
      running = true;
      startTs = null;
      rafId = requestAnimationFrame(tick);
    };
    const stop = ()=>{
      running = false;
      if(rafId) cancelAnimationFrame(rafId);
      rafId = null;
    };
    if('IntersectionObserver' in window){
      const obs = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
          if(e.isIntersecting) start();
          else stop();
        });
      }, { threshold: 0.3 });
      obs.observe(journey);
    } else {
      start();
    }
  } else if(journey){
    // reduced motion: set static end state (all 3 stages active)
    journey.style.setProperty('--journey-progress', '1');
    journey.querySelectorAll('.sales-journey__stage').forEach(s => s.classList.add('is-active'));
  }

})();
