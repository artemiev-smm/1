/* ============================================================
   Andrew Artemiev — Site Script
   ============================================================ */
;(function () {
  'use strict'

  document.documentElement.classList.add('js')

  /* ── Hero video retry ── */
  const heroVideo = document.querySelector('.hero__video')
  if (heroVideo) {
    const tryPlay = () => {
      const p = heroVideo.play()
      if (p && typeof p.catch === 'function') {
        p.catch(() => setTimeout(tryPlay, 2000))
      }
    }
    if (heroVideo.paused) tryPlay()
  }

  /* ── Sticky nav ── */
  const nav = document.querySelector('.nav')
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  }

  /* ── Mobile menu toggle ── */
  const toggle = document.querySelector('.nav__toggle')
  const menu = document.getElementById('mobile-menu')
  if (toggle && menu) {
    const open = () => {
      menu.hidden = false
      toggle.setAttribute('aria-expanded', 'true')
      document.body.style.overflow = 'hidden'
    }
    const close = () => {
      menu.hidden = true
      toggle.setAttribute('aria-expanded', 'false')
      document.body.style.overflow = ''
    }
    toggle.addEventListener('click', () => {
      menu.hidden ? open() : close()
    })
    menu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', close)
    )
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) close()
    })
  }

  /* ── Strip reveal overlay builder ── */
  document.querySelectorAll('.strip-wrap').forEach((wrap) => {
    const count = parseInt(wrap.dataset.strips, 10) || 6
    const container = document.createElement('div')
    container.classList.add('strips')
    container.setAttribute('aria-hidden', 'true')
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span')
      s.style.flex = '1'
      s.style.setProperty('--i', i)
      container.appendChild(s)
    }
    wrap.appendChild(container)
  })

  /* ── IntersectionObserver — scroll reveal ── */
  const reveals = document.querySelectorAll('[data-reveal]')
  if (reveals.length) {
    document.documentElement.classList.add('reveals-armed')

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
    )

    reveals.forEach((el) => io.observe(el))
  }

  /* ── Scroll cue fade ── */
  const scrollCue = document.querySelector('.scroll-cue')
  if (scrollCue) {
    const hideCue = () => {
      if (window.scrollY > 120) {
        scrollCue.classList.add('is-hidden')
      } else {
        scrollCue.classList.remove('is-hidden')
      }
    }
    window.addEventListener('scroll', hideCue, { passive: true })
    hideCue()
  }

  /* ── Lerp-based smooth scroll (desktop) ── */
  if (
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href')
        if (!id || id === '#') return
        const target = document.querySelector(id)
        if (!target) return
        e.preventDefault()

        const start = window.scrollY
        const end =
          target.getBoundingClientRect().top + window.scrollY - 80
        const dist = end - start
        let progress = 0

        const step = () => {
          progress += (1 - progress) * 0.085
          if (Math.abs(1 - progress) < 0.005) {
            window.scrollTo(0, end)
            return
          }
          window.scrollTo(0, start + dist * progress)
          requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      })
    })
  }

  /* ── Custom cursor (fine pointer only) ── */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const dot = document.querySelector('.cursor-dot')
    const trail = document.querySelector('.cursor-trail')

    if (dot && trail) {
      document.documentElement.classList.add('has-cursor')

      let mx = 0, my = 0
      let tx = 0, ty = 0

      document.addEventListener('mousemove', (e) => {
        mx = e.clientX
        my = e.clientY
        dot.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`
      })

      const lerp = () => {
        tx += (mx - tx) * 0.15
        ty += (my - ty) * 0.15
        trail.style.transform = `translate3d(${tx}px,${ty}px,0) translate(-50%,-50%)`
        requestAnimationFrame(lerp)
      }
      requestAnimationFrame(lerp)

      /* Hover grow on interactive elements */
      const hoverTargets = 'a, button, [role="button"], input, textarea, select'
      document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverTargets)) {
          document.documentElement.classList.add('cursor-hover')
        }
      })
      document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverTargets)) {
          document.documentElement.classList.remove('cursor-hover')
        }
      })
    }
  }
})()
