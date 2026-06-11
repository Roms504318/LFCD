/* ============================================================
   LFCD — Motion
   GSAP + ScrollTrigger choreography and Lenis smooth scroll,
   loaded from CDN in the page. This module is defensive:
   - prefers-reduced-motion disables everything
   - if the CDNs fail, the site renders fully static
   Content is never hidden by CSS; animations set initial
   states at runtime only when it is safe to do so.
   ============================================================ */

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
const hasLenis = typeof window.Lenis !== "undefined";

if (hasGSAP) window.gsap.registerPlugin(window.ScrollTrigger);

export function motionEnabled() {
  return !reduced && hasGSAP;
}

/* ---------- Smooth scroll ---------- */
export function initSmoothScroll() {
  if (reduced || !hasLenis || !hasGSAP) return;
  const lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on("scroll", window.ScrollTrigger.update);
  window.gsap.ticker.add((time) => lenis.raf(time * 1000));
  window.gsap.ticker.lagSmoothing(0);

  /* Anchor links route through Lenis so in-page jumps stay smooth */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -70 });
    });
  });
}

/* ---------- Scroll-triggered reveals ----------
   Elements opt in with data-reveal. Optional values:
   data-reveal="up" (default) | "fade" | "left" | "right"
   data-reveal-delay="0.15"  (seconds, for stagger feel) */
export function initReveals() {
  if (!motionEnabled()) return;
  const gsap = window.gsap;

  document.querySelectorAll("[data-reveal]").forEach((el) => {
    const kind = el.dataset.reveal || "up";
    const delay = parseFloat(el.dataset.revealDelay || 0);
    const from = { opacity: 0, duration: 0.9, delay, ease: "power3.out" };
    if (kind === "up") from.y = 44;
    if (kind === "left") from.x = -44;
    if (kind === "right") from.x = 44;
    gsap.from(el, {
      ...from,
      scrollTrigger: { trigger: el, start: "top 86%", once: true },
    });
  });

  /* Grids stagger their children */
  document.querySelectorAll("[data-reveal-stagger]").forEach((grid) => {
    gsap.from(grid.children, {
      opacity: 0,
      y: 36,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.09,
      scrollTrigger: { trigger: grid, start: "top 84%", once: true },
    });
  });
}

/* ---------- Parallax depth ----------
   data-parallax="0.15" → element drifts at 15% of scroll speed */
export function initParallax() {
  if (!motionEnabled()) return;
  const gsap = window.gsap;
  document.querySelectorAll("[data-parallax]").forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || 0.15);
    gsap.to(el, {
      yPercent: speed * -100,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    });
  });
}

/* ---------- Animated counters ----------
   data-count="25" data-count-format="percent|currency|number|plain"
   Counts from zero when scrolled into view. */
export function initCounters() {
  const els = document.querySelectorAll("[data-count]");
  if (!els.length) return;

  const render = (el, value) => {
    const format = el.dataset.countFormat || "number";
    const target = parseFloat(el.dataset.count);
    if (format === "percent") el.textContent = Math.round(value) + "%";
    else if (format === "currency-b") el.textContent = "$" + (value / 1e9).toFixed(2) + "B";
    else if (format === "currency-m") el.textContent = "$" + Math.round(value / 1e6) + "M";
    else if (format === "currency") el.textContent = "$" + Math.round(value).toLocaleString("en-US");
    else if (format === "currency-cents") el.textContent = "$" + value.toFixed(2);
    else if (format === "plain") el.textContent = el.dataset.countSuffix
      ? Math.round(value) + el.dataset.countSuffix : String(Math.round(value));
    else el.textContent = Math.round(value).toLocaleString("en-US");
    if (value >= target && el.dataset.countDone) el.textContent = el.dataset.countDone;
  };

  if (!motionEnabled()) {
    els.forEach((el) => render(el, parseFloat(el.dataset.count)));
    return;
  }

  const gsap = window.gsap;
  els.forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const state = { v: 0 };
    render(el, 0);
    gsap.to(state, {
      v: target,
      duration: Math.min(2.2, 0.9 + Math.log10(Math.max(target, 1)) * 0.25),
      ease: "power2.out",
      onUpdate: () => render(el, state.v),
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });
}

/* ---------- Comparison bars fill on scroll ---------- */
export function initBars() {
  const bars = document.querySelectorAll(".bar__fill[data-width]");
  const fill = (el) => { el.style.width = el.dataset.width + "%"; };
  if (!motionEnabled()) { bars.forEach(fill); return; }
  bars.forEach((el) => {
    window.ScrollTrigger.create({
      trigger: el, start: "top 90%", once: true, onEnter: () => fill(el),
    });
  });
}

/* ---------- Hero entrance + SVG draw ---------- */
export function initHero() {
  const corridorPath = document.querySelector(".hero__corridor path");
  if (corridorPath) {
    const len = corridorPath.getTotalLength();
    corridorPath.style.strokeDasharray = len;
    corridorPath.style.strokeDashoffset = motionEnabled() ? len : 0;
  }
  if (!motionEnabled()) return;
  const gsap = window.gsap;
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".hero__kicker, .hero .status-chip", { y: 24, opacity: 0, duration: 0.7, stagger: 0.1 })
    .from(".hero__title", { y: 56, opacity: 0, duration: 1 }, "-=0.35")
    .from(".hero__lede, .hero__welcome, .hero__actions", { y: 32, opacity: 0, duration: 0.8, stagger: 0.12 }, "-=0.55")
    .from(".hero__mark", { scale: 0.9, opacity: 0, duration: 1.2, ease: "power2.out" }, "-=0.9");
  if (corridorPath) {
    tl.to(corridorPath, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, "-=0.8")
      .from(".hero__corridor circle, .hero__corridor text", { opacity: 0, duration: 0.5, stagger: 0.08 }, "-=0.4");
  }

  /* District mark slow idle rotation of the wave ring */
  gsap.to(".mark-waves", { rotate: 360, transformOrigin: "50% 50%", duration: 90, repeat: -1, ease: "none" });
}
