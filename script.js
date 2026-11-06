/* ============================================================
   Andrew Artemiev — Site Script  v2
   ============================================================ */
;(function(){
  'use strict';

  const html = document.documentElement;
  html.classList.add('js');

  /* ── Hero video ── */
  const heroVideo = document.querySelector('.hero__video');
  if(heroVideo){
    let attempts = 0;
    const tryPlay = ()=>{
      heroVideo.play().catch(()=>{
        if(++attempts < 4) setTimeout(tryPlay, 800 * attempts);
      });
    };
    heroVideo.addEventListener('loadeddata', tryPlay, {once:true});
    if(heroVideo.readyState >= 2) tryPlay();
  }

  /* ── Sticky nav ── */
  const nav = document.querySelector('.nav');
  if(nav){
    const onScroll = ()=> nav.classList.toggle('is-scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  /* ── Mobile menu ── */
  const toggle = document.querySelector('.nav__toggle');
  const menu   = document.getElementById('mobile-menu');
  if(toggle && menu){
    toggle.addEventListener('click', ()=>{
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.hidden = open;
      document.body.style.overflow = open ? '' : 'hidden';
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', ()=>{
      toggle.setAttribute('aria-expanded','false');
      menu.hidden = true;
      document.body.style.overflow = '';
    }));
  }

  /* ── Strip reveal builder ── */
  document.querySelectorAll('.strip-wrap').forEach(el =>{
    const count = 5;
    const box = document.createElement('div');
    box.className = 'strips';
    box.setAttribute('aria-hidden','true');
    for(let i = 0; i < count; i++){
      const s = document.createElement('span');
      s.style.flex = '1';
      s.style.setProperty('--i', i);
      box.appendChild(s);
    }
    el.appendChild(box);
  });

  /* ── Scroll Reveal (IntersectionObserver) ── */
  // Arm reveals after a frame so initial state applies
  requestAnimationFrame(()=> html.classList.add('reveals-armed'));

  // Set stagger indices on timeline steps and format cards
  document.querySelectorAll('.timeline__step[data-reveal]').forEach((el,i)=>{
    el.style.setProperty('--step-i', i);
  });
  document.querySelectorAll('.format[data-reveal]').forEach((el,i)=>{
    el.style.setProperty('--step-i', i);
  });

  if('IntersectionObserver' in window){
    const revealObs = new IntersectionObserver((entries)=>{
      entries.forEach(e =>{
        if(e.isIntersecting){
          e.target.classList.add('is-in');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));
  }

  /* ── Timeline scroll-triggered progress ── */
  const timeline = document.querySelector('.timeline');
  if(timeline && 'IntersectionObserver' in window){
    const timelineObs = new IntersectionObserver((entries)=>{
      entries.forEach(e =>{
        if(e.isIntersecting){
          timeline.classList.add('is-animating');
          timelineObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    timelineObs.observe(timeline);
  }

  /* ── Contact accent line animation ── */
  const contactLine = document.querySelector('.contact__line');
  if(contactLine && 'IntersectionObserver' in window){
    const lineObs = new IntersectionObserver((entries)=>{
      entries.forEach(e =>{
        if(e.isIntersecting){
          e.target.classList.add('is-in');
          lineObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    lineObs.observe(contactLine);
  }

  /* ── Scroll cue fade ── */
  const scrollCue = document.querySelector('.scroll-cue');
  if(scrollCue){
    const cueCheck = ()=> scrollCue.classList.toggle('is-hidden', window.scrollY > 120);
    window.addEventListener('scroll', cueCheck, {passive:true});
    cueCheck();
  }

  /* ── Smooth scroll (lerp) — desktop only ── */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer  = window.matchMedia('(pointer: fine)').matches;

  if(!prefersReduced && isFinePointer && window.innerWidth > 900){
    let current = window.scrollY, target = current, raf = 0;
    const LERP = 0.09;
    const update = ()=>{
      current += (target - current) * LERP;
      if(Math.abs(target - current) < 0.5){ current = target; }
      window.scrollTo(0, current);
      if(current !== target) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', ()=>{ target = window.scrollY; }, {passive:true});
    window.addEventListener('wheel', (e)=>{
      e.preventDefault();
      target = Math.max(0, Math.min(target + e.deltaY, document.body.scrollHeight - window.innerHeight));
      if(!raf) raf = requestAnimationFrame(update);
    }, {passive: false});
  }

  /* ── Custom cursor ── */
  if(isFinePointer && !prefersReduced){
    const dot   = document.querySelector('.cursor-dot');
    const trail = document.querySelector('.cursor-trail');
    if(dot && trail){
      html.classList.add('has-cursor');
      let mx = -100, my = -100, tx = mx, ty = my;
      const moveDot = ()=>{
        dot.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
      };
      const moveTrail = ()=>{
        tx += (mx - tx) * 0.15;
        ty += (my - ty) * 0.15;
        trail.style.transform = `translate3d(${tx}px,${ty}px,0) translate(-50%,-50%)`;
        requestAnimationFrame(moveTrail);
      };
      document.addEventListener('mousemove', e =>{ mx = e.clientX; my = e.clientY; moveDot(); }, {passive:true});
      requestAnimationFrame(moveTrail);

      const hoverTargets = 'a, button, [role="button"], input, textarea, select, .format';
      document.addEventListener('mouseover', e =>{
        if(e.target.closest(hoverTargets)) html.classList.add('cursor-hover');
      }, {passive:true});
      document.addEventListener('mouseout', e =>{
        if(e.target.closest(hoverTargets)) html.classList.remove('cursor-hover');
      }, {passive:true});
    }
  }

})();
