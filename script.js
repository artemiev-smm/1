/* ============================================================
   Andrew Artemiev — Site Script  v5
   Native scroll + IntersectionObserver reveals. No wheel hijack.
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

  /* ── Hero-in-view (nav light styles over dark hero) ── */
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

  /* ── Split hero headline into words ── */
  const splitTarget = document.querySelector('[data-split]');
  if(splitTarget && !prefersReduced){
    let i = 0;
    splitTarget.querySelectorAll('.hero__title-line').forEach(line=>{
      // Walk nodes so we keep inline <em>/<span> elements intact
      const original = Array.from(line.childNodes);
      const wrap = [];
      original.forEach(node=>{
        if(node.nodeType === 3){
          // text — split on whitespace
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
          // element — wrap whole
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

  /* ── Mark reveal targets ── */
  const revealTargets = [
    '.hero__sub',
    '.about__title', '.about__body', '.about__gallery',
    '.path__head',
    '.work__head', '.format', '.work__cta',
    '.quote-card',
    '.channel__text', '.channel__btn',
    '.contact__title', '.btn-premium'
  ];
  revealTargets.forEach(sel=>{
    document.querySelectorAll(sel).forEach(el => el.setAttribute('data-reveal',''));
  });

  document.querySelectorAll('.format').forEach((el,i)=> el.style.setProperty('--i', i));

  requestAnimationFrame(()=> html.classList.add('reveals-armed'));

  /* ── IntersectionObserver ── */
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

    /* Timeline — line fill + sequential photo fall ── */
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

    /* Contact accent line */
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
    const timeline = document.querySelector('.timeline');
    if(timeline) timeline.classList.add('is-animating');
    const contactLine = document.querySelector('.contact__line');
    if(contactLine) contactLine.classList.add('is-in');
  }

  /* ── Scroll cue fade ── */
  const scrollCue = document.querySelector('.scroll-cue');
  if(scrollCue){
    const cueCheck = ()=> scrollCue.classList.toggle('is-hidden', window.scrollY > 120);
    window.addEventListener('scroll', cueCheck, {passive:true});
    cueCheck();
  }

  /* ── Parallax for section words (desktop only) ── */
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

})();
