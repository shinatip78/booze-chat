// Shared motion layer for the BOOZE direction drafts (GSAP + ScrollTrigger + Lenis loaded by each page).
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none)').matches;
  const seg = new Intl.Segmenter('th', { granularity: 'word' });
  window.BOOZE_FX = { reduce, touch };

  // Split text into word spans without breaking Thai clusters. mode 'mask' wraps each word for a slide-up reveal.
  function split(el, mode) {
    const words = [];
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const s of seg.segment(n.textContent)) {
            if (!s.segment.trim()) { frag.append(s.segment); continue; }
            const w = document.createElement('span'); w.className = 'w'; w.textContent = s.segment;
            if (mode === 'mask') { const m = document.createElement('span'); m.className = 'wm'; m.append(w); frag.append(m); }
            else frag.append(w);
            words.push(w);
          }
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el); return words;
  }
  window.BOOZE_FX.split = split;

  if (reduce) { document.documentElement.classList.add('ready'); document.querySelectorAll('[data-preloader]').forEach(p => p.remove()); return; }

  // smooth scroll
  const lenis = new Lenis({ lerp: 0.085 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  gsap.registerPlugin(ScrollTrigger);
  window.BOOZE_FX.lenis = lenis;

  // preloader → hero entrance
  const pre = document.querySelector('[data-preloader]');
  const enter = () => {
    document.documentElement.classList.add('ready');
    document.querySelectorAll('[data-split-in]').forEach((el, i) => {
      const w = split(el, 'mask');
      gsap.from(w, { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.045, delay: 0.15 + i * 0.12 });
    });
    gsap.from('[data-fade-in]', { opacity: 0, y: 18, duration: 1.2, ease: 'power3.out', stagger: 0.1, delay: 0.55 });
    gsap.fromTo('[data-hero-media]', { scale: 1.18 }, { scale: 1, duration: 2.6, ease: 'expo.out' });
  };
  if (pre) {
    const bar = pre.querySelector('i');
    const tl = gsap.timeline({ onComplete: () => { pre.remove(); } });
    tl.to(bar, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' })
      .to(pre.querySelector('img'), { opacity: 0, y: -10, duration: 0.4 }, '-=0.1')
      .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' })
      .add(enter, '-=0.55');
  } else enter();

  // scroll word highlight (grey → ink) for manifesto lines
  document.querySelectorAll('[data-scrub-words]').forEach(el => {
    const w = split(el);
    gsap.fromTo(w, { opacity: 0.16 }, { opacity: 1, stagger: 0.08, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: true } });
  });

  // headings that rise into place once
  document.querySelectorAll('[data-split-up]').forEach(el => {
    const w = split(el, 'mask');
    gsap.from(w, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.04,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  // images unveil with a clip wipe + settle
  document.querySelectorAll('[data-unveil]').forEach(el => {
    const img = el.querySelector('img');
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 82%', once: true } })
      .fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'expo.inOut' })
      .fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0);
  });

  // gentle parallax inside frames
  document.querySelectorAll('[data-parallax] img').forEach(img => {
    gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // magnetic buttons
  if (!touch) document.querySelectorAll('[data-magnetic]').forEach(b => {
    const x = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' }), y = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.25); y((e.clientY - r.top - r.height / 2) * 0.35); });
    b.addEventListener('pointerleave', () => { x(0); y(0); });
  });
})();
