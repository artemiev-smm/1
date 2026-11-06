/* ============================================================
   Andrew Artemiev — Site Script  v3
   Native scroll + IntersectionObserver reveals. No wheel hijack.
   ============================================================ */
;(function(){
  'use strict';

  const html = document.documentElement;
  html.classList.add('js');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Hero video — robust autoplay ── */
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
    // Resume on tab focus
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

  /* ── Mobile menu ── */
  const toggle = document.querySelector('.nav__toggle');
  const menu   = document.getElementById('mobile-menu');
  if(toggle && menu){
    const closeMenu = ()=>{
      toggle.setAttribute('aria-expanded','false');
      menu.hidden = true;
      document.body.style.overflow = '';
    };
    toggle.addEventListener('click', ()=>{
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.hidden = open;
      document.body.style.overflow = open ? '' : 'hidden';
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    // Close on esc
    document.addEventListener('keydown', e=>{
      if(e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu();
    });
  }

  /* ── Split hero headline into words for stagger reveal ── */
  const splitTarget = document.querySelector('[data-split]');
  if(splitTarget && !prefersReduced){
    let i = 0;
    splitTarget.querySelectorAll('.hero__title-line').forEach(line=>{
      const text = line.innerHTML;
      // Split on space, preserving <em>…</em> as one unit
      const parts = [];
      const tokens = text.split(/(<em>.*?<\/em>|\s+)/g).filter(t => t && t.trim().length);
      tokens.forEach(tok=>{
        const span = document.createElement('span');
        span.className = 'word';
        span.style.setProperty('--i', i++);
        span.innerHTML = tok;
        parts.push(span);
      });
      line.innerHTML = '';
      parts.forEach((p,idx)=>{
        line.appendChild(p);
        if(idx < parts.length - 1) line.appendChild(document.createTextNode(' '));
      });
    });
    // Trigger reveal immediately on paint; safety fallback at 300ms.
    const show = ()=> splitTarget.classList.add('is-in');
    requestAnimationFrame(()=> requestAnimationFrame(show));
    setTimeout(show, 300);
  } else if(splitTarget){
    splitTarget.classList.add('is-in');
  }

  /* ── Safety fallback: if IntersectionObserver fails or an item
     never comes into view (user never scrolled near it), reveal it
     anyway so content is never permanently hidden. ── */
  setTimeout(()=>{
    document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(el => el.classList.add('is-in'));
  }, 4500);

  /* ── Scroll reveal: mark elements ── */
  const revealTargets = [
    '.about__col--text > .eyebrow', '.about__title', '.about__body', '.about__stat',
    '.about__col--photo',
    '.path__head', '.timeline__step',
    '.work__head', '.format', '.work__cta',
    '.quote-section__figure', '.quote-section__text',
    '.channel__text', '.channel__btn',
    '.contact__inner > .eyebrow', '.contact__title', '.contact__sub', '.cta',
    '.photo-reveal'
  ];
  revealTargets.forEach(sel=>{
    document.querySelectorAll(sel).forEach(el => el.setAttribute('data-reveal',''));
  });

  // Stagger indices for sibling groups
  document.querySelectorAll('.timeline__step').forEach((el,i)=> el.style.setProperty('--i', i));
  document.querySelectorAll('.format').forEach((el,i)=> el.style.setProperty('--i', i));

  // Arm reveals
  requestAnimationFrame(()=> html.classList.add('reveals-armed'));

  /* ── IntersectionObserver for reveals ── */
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

    /* ── Timeline progress line ── */
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

    /* ── Contact accent line ── */
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
    // Fallback: show everything
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

  /* ── Parallax for giant background section words ── */
  if(!prefersReduced && window.matchMedia('(min-width: 900px)').matches){
    const words = document.querySelectorAll('.section__word');
    if(words.length && 'IntersectionObserver' in window){
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
            const offset = (center - vh/2) * 0.08;
            w.style.transform = `translate3d(0, ${offset * -1}px, 0)`;
          });
          ticking = false;
        });
      };
      window.addEventListener('scroll', onScroll, {passive:true});
      onScroll();
    }
  }

  /* ── Smooth anchor scroll with offset for sticky nav ── */
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

  /* NOTE: No wheel-hijacking lerp scroll. Native scroll only — the
     previous version's preventDefault on wheel broke the mouse. */

})();
