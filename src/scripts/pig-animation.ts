import { playSound } from "@lib/audio-manager";

/**
 * The header pig. JS only computes a few numbers and writes them as CSS
 * variables on the SVG; the layers' movement lives in Header.astro's CSS.
 *   --lx, --ly  look direction, each within -1..1
 *   --sniff     snout pulse, 0..1
 */

const LOOK_RANGE = 300; // px: the look levels off smoothly past ~2× this
const IDLE_AFTER = 3000; // ms without pointer movement before recentring
const NEAR_IN = 50; // px from centre: start sniffing
const NEAR_OUT = 70; // px: stop sniffing (hysteresis)
const STIFFNESS = 140; // spring
const DAMPING = 10; // well under critical (~23.7) for a lively overshoot
const SNIFF_HZ = 5;

let cleanup: (() => void) | null = null;

export function initPigAnimation() {
  cleanup?.();
  cleanup = null;

  const svg = document.querySelector<SVGSVGElement>(".cochon-svg");
  if (!svg) return;
  const ears = svg.querySelectorAll<SVGElement>(".pig-ear");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };
  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  // Spring state.
  let tx = 0, ty = 0; // target
  let x = 0, y = 0, vx = 0, vy = 0; // current
  let near = false;
  let sniffEnv = 0, sniffPhase = 0;
  let raf: number | null = null;
  let last = 0;
  let idleTimer: number | null = null;

  const write = () => {
    svg.style.setProperty("--lx", x.toFixed(4));
    svg.style.setProperty("--ly", y.toFixed(4));
    svg.style.setProperty("--sniff", (sniffEnv * (0.5 - 0.5 * Math.cos(sniffPhase))).toFixed(4));
  };

  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;

    const ax = STIFFNESS * (tx - x) - DAMPING * vx;
    const ay = STIFFNESS * (ty - y) - DAMPING * vy;
    vx += ax * dt; vy += ay * dt;
    x += vx * dt; y += vy * dt;

    sniffEnv += ((near ? 1 : 0) - sniffEnv) * (1 - Math.exp(-dt * 10));
    sniffPhase += dt * SNIFF_HZ * Math.PI * 2;

    write();

    const settled =
      Math.abs(tx - x) < 1e-3 && Math.abs(ty - y) < 1e-3 &&
      Math.abs(vx) < 1e-3 && Math.abs(vy) < 1e-3 &&
      !near && sniffEnv < 1e-3;
    if (settled) {
      x = tx; y = ty; vx = vy = 0; sniffEnv = 0; sniffPhase = 0;
      write();
      raf = null;
    } else {
      raf = requestAnimationFrame(frame);
    }
  };

  const wake = () => {
    if (raf !== null) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const r = svg.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    const k = d ? Math.tanh(d / LOOK_RANGE) / d : 0;
    tx = dx * k;
    ty = dy * k;

    const wasNear = near;
    near = d < (near ? NEAR_OUT : NEAR_IN);
    if (near && !wasNear) {
      sniffPhase = 0;
      playSound("swipe_02", 0.04);
    }

    if (idleTimer !== null) clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      tx = ty = 0;
      near = false;
      wake();
    }, IDLE_AFTER);

    wake();
  };

  // Blinks: every 3–7s, sometimes a double blink.
  const blink = (times: number) => {
    svg.classList.add("is-blinking");
    later(() => {
      svg.classList.remove("is-blinking");
      if (times > 1) later(() => blink(times - 1), 140);
      else later(() => blink(Math.random() < 0.2 ? 2 : 1), rand(3000, 7000));
    }, 120);
  };
  later(() => blink(1), rand(1500, 4000));

  // Ear flick: now and then, one ear.
  const flick = () => {
    const ear = ears[Math.floor(Math.random() * ears.length)];
    if (ear) {
      ear.classList.remove("is-flicking");
      void ear.getBoundingClientRect(); // restart the animation
      ear.classList.add("is-flicking");
    }
    later(flick, rand(7000, 14000));
  };

  // Click / tap: squash-and-stretch.
  const onDown = () => {
    svg.classList.remove("is-bouncing");
    void svg.getBoundingClientRect();
    svg.classList.add("is-bouncing");
  };
  const onAnimEnd = (e: AnimationEvent) => {
    (e.target as Element).classList.remove("is-bouncing", "is-flicking");
  };

  svg.addEventListener("animationend", onAnimEnd);
  if (!reduced) {
    window.addEventListener("pointermove", onMove, { passive: true });
    svg.addEventListener("pointerdown", onDown);
    later(flick, rand(5000, 10000));
  }

  cleanup = () => {
    window.removeEventListener("pointermove", onMove);
    svg.removeEventListener("pointerdown", onDown);
    svg.removeEventListener("animationend", onAnimEnd);
    if (raf !== null) cancelAnimationFrame(raf);
    if (idleTimer !== null) clearTimeout(idleTimer);
    timers.forEach(clearTimeout);
  };
}
