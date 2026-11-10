import { FIELDS } from "./fields";
import type { AsciiState, Field, FieldCtx, Rect, ShapeBuffer } from "./types";

const DENSITY = " .:-=+*#%@";
const DLEN = DENSITY.length;
/**
 * Field space. The original animations ran on 7×8px cells with dx scaled by
 * 0.875, i.e. 8px per unit on both axes. Fields are sampled in those units
 * from pixel positions, so their proportions don't depend on the glyph grid.
 */
const UNIT_X = 7;
const UNIT = 8;
/** Opacity steps layered on top of the glyph ramp: smoother gradients and edges. */
const ALPHAS = [0.42, 0.7, 1];
const NA = ALPHAS.length;
/** Ink 0 = field (muted), ink 1 = shape (accent). Bucket = ink * NA + alpha step. */
const NB = 2 * NA;
/** Field clock speed (field units per second). The old code ran ~0.48/s. */
const CLOCK = 0.62;
/** Seconds of each playlist period spent blending into the next field. */
const PLAYLIST_BLEND = 2.2;
/** How quickly `progress` chases `target` (higher = snappier). */
const SPRING = 4.5;
/** Speed of the blend from the previous page's stage into the new one. */
const CARRY_SPRING = 3;
const CARRY = "__carry";
/** Magnifier under the cursor: radius (px) and strength. Follows the pointer with no easing. */
const LENS_RADIUS = 150;
const LENS_STRENGTH = 0.5;
/** Press and hold: the hole grows to this radius (px) and reaches this far (px). */
const HOLD_RADIUS = 60;
const HOLD_REACH = 150;
/** Holding this long (ms) reaches the biggest ripple and makes the hole vibrate. */
const HOLD_MAX = 2000;
/** Ripples: spawned by clicks. */
const RIPPLE_SPEED = 460;
const RIPPLE_LIFE = 1.9;
const RIPPLE_WIDTH = 26;
const RIPPLE_MAX = 8;
/** How much the circle draws in (fraction of its radius) halfway through a side-to-side move. */
const TRAVEL_GATHER = 0.32;

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  fontSize?: number;
}

export type Rgba = [number, number, number, number];

interface Reveal {
  x: number;
  y: number;
  start: number;
  speed: number;
  front: number;
}

interface Ripple {
  x: number;
  y: number;
  start: number;
  amp: number;
  /** Bigger ripples travel faster and farther, and last longer. */
  size: number;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * One state standing for the blend of A and B at k: rects (frozen at their
 * current value) and numbers interpolated; field, playlist and shape from
 * whichever side dominates.
 */
function mixStates(A: AsciiState, B: AsciiState, k: number): AsciiState {
  const D = k < 0.5 ? A : B;
  const frame = lerpRect(A.frame(), B.frame(), k);
  const focus = lerpRect((A.focus ?? A.frame)(), (B.focus ?? B.frame)(), k);
  const num = (a: number | undefined, b: number | undefined, d: number) => lerp(a ?? d, b ?? d, k);
  return {
    ...D,
    frame: () => frame,
    focus: () => focus,
    intensity: lerp(A.intensity, B.intensity, k),
    ambient: lerp(A.ambient, B.ambient, k),
    accent: num(A.accent, B.accent, 0),
    shapeScale: num(A.shapeScale, B.shapeScale, 0.8),
    warp: num(A.warp, B.warp, 1),
    texture: num(A.texture, B.texture, 1),
  };
}

function lerpRect(a: Rect, b: Rect, t: number): Rect {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) };
}

/** Bilinear sample of a square buffer at normalised uv; returns `outside` beyond [0,1]. */
function sample(buf: Float32Array, size: number, u: number, v: number, outside: number): number {
  if (u < 0 || v < 0 || u >= 1 || v >= 1) return outside;
  const fx = u * size - 0.5;
  const fy = v * size - 0.5;
  let x0 = Math.floor(fx);
  let y0 = Math.floor(fy);
  const tx = fx - x0;
  const ty = fy - y0;
  let x1 = x0 + 1;
  let y1 = y0 + 1;
  if (x0 < 0) x0 = 0;
  if (y0 < 0) y0 = 0;
  if (x1 >= size) x1 = size - 1;
  if (y1 >= size) y1 = size - 1;
  const a = buf[y0 * size + x0];
  const b = buf[y0 * size + x1];
  const c = buf[y1 * size + x0];
  const d = buf[y1 * size + x1];
  return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
}

/**
 * Full-viewport ASCII stage. The page sets `target` (a float index into
 * `states`); `progress` follows it with a spring, so scrolling has weight and
 * every change is a blend.
 */
export class AsciiEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private fontSize: number;
  private cellW = 7;
  private cellH = 9;
  private cols = 0;
  private rows = 0;
  private shapes = new Map<string, ShapeBuffer>();
  private fieldCache = new Map<string, Field>();
  private states: AsciiState[] = [];
  private raf = 0;
  private last = 0;
  private t = 0;
  /** Real seconds, for playlists. */
  private clock = 0;
  private reveal: Reveal | null = null;
  private running = false;
  private reduced = false;
  private buckets: string[][] = [];
  private used = new Uint8Array(NB);
  private bucketStyle: string[] = new Array(NB).fill("#000");
  // Pointer lens (eased).
  private pointer = { x: -9999, y: -9999, s: 0 };
  private ripples: Ripple[] = [];
  // Press and hold: `s` eases 0..1 while held; `down` is when it started.
  private press = { s: 0, on: false, down: 0 };

  /** Float index into `states` the page wants to show. */
  target = 0;
  /** Smoothed index actually rendered. */
  progress = 0;
  /** Scroll velocity in px/s (set by the page); swells the circle a little. */
  velocity = 0;

  constructor(opts: EngineOptions) {
    this.canvas = opts.canvas;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    this.ctx = ctx;
    this.fontSize = opts.fontSize ?? 10;
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.onResize = this.onResize.bind(this);
    this.onPointer = this.onPointer.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.tick = this.tick.bind(this);
    this.onVisibility = this.onVisibility.bind(this);
    this.setInks([0, 0, 0, 0.3], [249, 115, 22, 0.9]);
  }

  get reducedMotion() {
    return this.reduced;
  }

  setShape(key: string, buf: ShapeBuffer) {
    this.shapes.set(key, buf);
  }

  getShape(key: string): ShapeBuffer | undefined {
    return this.shapes.get(key);
  }

  // ---- Carry-over between pages ----
  // The engine outlives page navigations (the canvas is persisted). On leaving,
  // a page freezes what is on screen; the next page sets its own states, and
  // the frozen state blends into them over time instead of cutting.
  private carryState: AsciiState | null = null;
  private carryK = 1;
  /** The blend drawn last (states and weight), so `hold` freezes exactly what is on screen. */
  private shown: { A: AsciiState; B: AsciiState; k: number } | null = null;

  /** True while blending in from the previous page. */
  get carrying() {
    return this.carryK < 1 && !!this.carryState;
  }

  /**
   * Freeze what is on screen (rects and numbers at their current blend, the
   * dominant field and shape) and forget the page's states and shapes.
   */
  hold() {
    if (!this.shown) return;
    const { A, B, k } = this.shown;
    const st = mixStates(A, B, k);
    const shape = st.shape ? this.shapes.get(st.shape) : undefined;
    this.shapes.clear();
    if (shape) this.shapes.set(CARRY, shape);
    this.carryState = { ...st, shape: shape ? CARRY : null };
    this.carryK = 0;
    this.states = [];
    this.shown = null;
  }

  setStates(states: AsciiState[]) {
    this.states = states;
  }

  /** Field ink (muted) and shape ink (accent), as [r, g, b, alpha]. */
  setInks(field: Rgba, shape: Rgba) {
    for (let a = 0; a < NA; a++) {
      this.bucketStyle[a] = `rgba(${field[0]},${field[1]},${field[2]},${(field[3] * ALPHAS[a]).toFixed(3)})`;
      this.bucketStyle[NA + a] = `rgba(${shape[0]},${shape[1]},${shape[2]},${(shape[3] * ALPHAS[a]).toFixed(3)})`;
    }
  }

  /** Start the ring that uncovers the grid from a point (CSS px). */
  startReveal(x: number, y: number, speed = 1400, front = 90) {
    this.reveal = { x, y, start: performance.now(), speed, front };
  }

  /** Jump the spring to its target (e.g. on load). */
  settle() {
    this.progress = this.target;
  }

  start() {
    if (this.running) return;
    this.running = true;
    addEventListener("resize", this.onResize);
    addEventListener("pointermove", this.onPointer, { passive: true });
    addEventListener("pointerdown", this.onDown, { passive: true });
    addEventListener("pointerup", this.onUp, { passive: true });
    addEventListener("pointercancel", this.onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", this.onLeave);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.onResize();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    removeEventListener("resize", this.onResize);
    removeEventListener("pointermove", this.onPointer);
    removeEventListener("pointerdown", this.onDown);
    removeEventListener("pointerup", this.onUp);
    removeEventListener("pointercancel", this.onUp);
    document.documentElement.removeEventListener("pointerleave", this.onLeave);
    document.removeEventListener("visibilitychange", this.onVisibility);
  }

  private onVisibility() {
    cancelAnimationFrame(this.raf);
    if (!document.hidden && this.running) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  private onResize() {
    const dpr = Math.min(2, devicePixelRatio || 1);
    const w = innerWidth;
    const h = innerHeight;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    const ctx = this.ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${this.fontSize}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textBaseline = "top";
    this.cellW = ctx.measureText("M").width;
    // Tight leading like the original (10px glyphs on 8px rows).
    this.cellH = Math.round(this.fontSize * 0.8);
    this.cols = Math.ceil(w / this.cellW);
    this.rows = Math.ceil(h / this.cellH);
    this.buckets = Array.from({ length: NB }, () => new Array(this.cols).fill(" "));
  }

  private onPointer(e: PointerEvent) {
    if (e.pointerType === "touch" || this.reduced) return;
    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
    this.pointer.s = 1;
  }

  /** Press: a hole opens under the pointer and deepens while it is held. */
  private onDown(e: PointerEvent) {
    if (this.reduced) return;
    // Touch never hovers, so place the pointer where it landed.
    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
    this.press.on = true;
    this.press.down = performance.now();
  }

  /** Release: the hole closes and sends out a ripple, stronger the longer it was held. */
  private onUp() {
    if (!this.press.on) return;
    this.press.on = false;
    const now = performance.now();
    const held = clamp01((now - this.press.down) / HOLD_MAX);
    this.addRipple(this.pointer.x, this.pointer.y, 0.7 + 0.5 * held, 0.65 + 1.15 * held, now);
  }

  private addRipple(x: number, y: number, amp: number, size: number, now: number) {
    this.ripples.push({ x, y, start: now, amp, size });
    if (this.ripples.length > RIPPLE_MAX) this.ripples.shift();
  }

  private onLeave() {
    this.pointer.s = 0;
  }

  private field(name: string): Field {
    let f = this.fieldCache.get(name);
    if (!f) {
      f = (FIELDS[name] ?? FIELDS.wave)();
      this.fieldCache.set(name, f);
    }
    return f;
  }

  private tick(now: number) {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.tick);
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    if (this.reduced) {
      this.progress = this.target;
      this.carryK = 1;
    } else {
      this.t += dt * CLOCK;
      this.clock += dt;
      this.progress += (this.target - this.progress) * (1 - Math.exp(-dt * SPRING));
      if (this.carryK < 1 && this.states.length) {
        this.carryK += (1 - this.carryK) * (1 - Math.exp(-dt * CARRY_SPRING));
        if (this.carryK > 0.998) this.carryK = 1;
      }
      if (Math.abs(this.target - this.progress) < 1e-4) this.progress = this.target;
      const h = this.press;
      h.s += ((h.on ? 1 : 0) - h.s) * (1 - Math.exp(-dt * (h.on ? 5 : 11)));
      if (h.s < 0.002) h.s = 0;
    }
    this.draw(now);
  }

  /** A state's field(s) right now: a single field, or two playlist fields and a blend weight. */
  private stateFields(st: AsciiState): { a: Field; b: Field; w: number } {
    const list = st.fields;
    if (!list || list.length < 2) {
      const f = this.field(st.field);
      return { a: f, b: f, w: 0 };
    }
    const period = st.period ?? 7;
    const pos = this.clock / period;
    const idx = Math.floor(pos);
    const into = (pos - idx) * period; // seconds into this period
    const w = smooth(clamp01((into - (period - PLAYLIST_BLEND)) / PLAYLIST_BLEND));
    return { a: this.field(list[idx % list.length]), b: this.field(list[(idx + 1) % list.length]), w };
  }

  /** Render one frame. */
  draw(now = performance.now()) {
    const n = this.states.length;
    if (!n || !this.cols) return;
    const p = Math.min(n - 1, Math.max(0, this.progress));
    const i = Math.max(0, Math.min(n - 2, Math.floor(p)));
    let A = this.states[i];
    let B = n > 1 ? this.states[i + 1] : A;
    let k = n > 1 ? smooth(clamp01(p - i)) : 0;
    // Arriving from another page: blend from what was on screen there into
    // whatever this page shows right now (itself possibly mid-blend).
    if (this.carryK < 1 && this.carryState) {
      B = k <= 0 ? A : k >= 1 ? B : mixStates(A, B, k);
      A = this.carryState;
      k = smooth(this.carryK);
    }
    this.shown = { A, B, k };
    // The shape switches in a narrow window mid-transition, hidden by the
    // scatter; everything else (field, frame, ink) blends across all of it.
    const ks = smooth(clamp01((k - 0.3) / 0.4));
    // States with warp 0 (the portrait) never morph: they crossfade cleanly.
    const rigid = (A.warp ?? 1) === 0 || (B.warp ?? 1) === 0;
    const scatter = A === B || this.reduced || rigid ? 0 : Math.sin(Math.PI * k);
    const t = this.t;

    const FA = this.stateFields(A);
    const FB = this.stateFields(B);
    const fctx: FieldCtx = { t, cols: innerWidth / UNIT_X, rows: innerHeight / UNIT };
    const live = new Set<Field>();
    if (k < 1) {
      live.add(FA.a);
      if (FA.w > 0) live.add(FA.b);
    }
    if (k > 0) {
      live.add(FB.a);
      if (FB.w > 0) live.add(FB.b);
    }
    for (const f of live) f.prepare?.(fctx);
    const accent = lerp(A.accent ?? 0, B.accent ?? 0, k);
    // With no shape to carry the dense glyphs, the field itself uses the full ramp.
    const fieldMax = lerp(A.shape ? 0.5 : 1, B.shape ? 0.5 : 1, k);
    const accentT = accent > 0 ? 1.15 - accent * 0.55 : 9;

    const sA = A.shape ? this.shapes.get(A.shape) : undefined;
    const sB = B.shape ? this.shapes.get(B.shape) : undefined;
    const sdfBlend = !!(sA?.sdf && sB?.sdf);
    const melt = sdfBlend && !((A.warp ?? 1) === 0 || (B.warp ?? 1) === 0);
    const wA = sA ? 1 - ks : 0;
    const wB = sB ? ks : 0;
    const hasShape = wA + wB > 0;

    const rA = A.frame();
    const rB = B.frame();
    const r = lerpRect(rA, rB, k);
    const fo = lerpRect((A.focus ?? A.frame)(), (B.focus ?? B.frame)(), k);
    const intensity = lerp(A.intensity, B.intensity, k);
    const ambient = lerp(A.ambient, B.ambient, k);
    const shapeScale = lerp(A.shapeScale ?? 0.8, B.shapeScale ?? 0.8, k);
    const warpAmt = this.reduced ? 0 : lerp(A.warp ?? 1, B.warp ?? 1, k);
    const texture = lerp(A.texture ?? 1, B.texture ?? 1, k);
    const shA = sA?.shade;
    const shB = sB?.shade;

    const side = Math.min(fo.w, fo.h) * shapeScale;
    const sqX = fo.x + (fo.w - side) / 2;
    const sqY = fo.y + (fo.h - side) / 2;
    const cw = this.cellW;
    const ch = this.cellH;
    const fcx = fo.x + fo.w / 2; // px
    const fcy = fo.y + fo.h / 2;

    // Always a perfect circle, inscribed in the frame (centred on it, its
    // diameter the frame's short side). It breathes slowly and swells a
    // little with scroll speed, evenly, so it never turns into an ellipse.
    const breathe = this.reduced ? 1 : 1 + 0.025 * Math.sin(t * 1.4);
    const swell = 1 + Math.min(0.05, Math.abs(this.velocity) / 18000);
    const ecx = r.x + r.w / 2;
    const ecy = r.y + r.h / 2;
    // Crossing the screen, it draws in a little on the way and opens again on
    // arrival, deepest mid-move. Only for real crossings (side to side), scaled
    // by how far the centre travels; small moves keep their size.
    const travel = Math.abs(rB.x + rB.w / 2 - (rA.x + rA.w / 2)) / innerWidth;
    const gather = 1 - TRAVEL_GATHER * smooth(clamp01((travel - 0.2) / 0.3)) * Math.sin(Math.PI * k);
    const erx = Math.max(1, (Math.min(r.w, r.h) / 2) * breathe * swell * gather);
    const ery = erx;
    const rim = 0.32;

    // Reveal ring
    let rv = Infinity;
    let rvFront = 1;
    let revX = 0;
    let revY = 0;
    const rev = this.reveal;
    if (rev) {
      if (this.reduced) this.reveal = null;
      else {
        rv = ((now - rev.start) / 1000) * rev.speed;
        rvFront = rev.front;
        revX = rev.x;
        revY = rev.y;
        if (rv > Math.hypot(innerWidth, innerHeight) + rev.front) this.reveal = null;
      }
    }

    // Press and hold: how long, 0..1 over HOLD_MAX; at the max the hole vibrates.
    const hs = this.press.s;
    const held = this.press.on ? clamp01((now - this.press.down) / HOLD_MAX) : 0;
    const vib = this.press.on ? smooth(clamp01(((now - this.press.down) / HOLD_MAX - 1) / 0.12 + 0)) : 0;
    const shake = now * 0.001;
    // The lens steps aside while the hole is open.
    const ls = this.pointer.s * LENS_STRENGTH * (1 - hs);
    const lr2 = LENS_RADIUS * LENS_RADIUS;
    const lx0 = this.pointer.x;
    const ly0 = this.pointer.y;

    // Live ripples, as expanding rings (radius, amplitude).
    this.ripples = this.ripples.filter((r) => (now - r.start) / 1000 < RIPPLE_LIFE * r.size);
    const rips = this.ripples.map((r) => {
      const age = (now - r.start) / 1000;
      return { x: r.x, y: r.y, rad: age * RIPPLE_SPEED * r.size, amp: r.amp * (1 - age / (RIPPLE_LIFE * r.size)) ** 2 };
    });
    const reach = RIPPLE_WIDTH * 3;

    const warp = 0.01 * warpAmt;
    const scat = scatter * 0.075;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const buckets = this.buckets;
    const used = this.used;

    for (let y = 0; y < this.rows; y++) {
      const py = (y + 0.5) * ch;
      used.fill(0);
      for (let x = 0; x < this.cols; x++) {
        const px = (x + 0.5) * cw;

        const enx = (px - ecx) / erx;
        const eny = (py - ecy) / ery;
        const er2 = enx * enx + eny * eny;
        let ell = 0;
        if (er2 < 1) ell = smooth(clamp01((1 - Math.sqrt(er2)) / rim));

        let front = 0;
        if (rv !== Infinity) {
          const d = Math.hypot(px - revX, py - revY);
          if (d > rv) continue;
          if (d > rv - rvFront) front = 1 - (rv - d) / rvFront;
        }
        if (ell < 0.004 && front <= 0) continue;

        let sx = px;
        let sy = py;
        let holeMul = 1;
        // Magnifier: sample from a point pulled towards the pointer.
        let lens = 0;
        if (ls > 0) {
          const mx = px - lx0;
          const my = py - ly0;
          const md2 = mx * mx + my * my;
          if (md2 < lr2) {
            const g = 1 - Math.sqrt(md2) / LENS_RADIUS;
            lens = g * g * ls;
            sx = px - mx * lens;
            sy = py - my * lens;
          }
        }

        // Press and hold: a round hole opens under the pointer, content squeezed
        // outward. Longer holds make it bigger; at the max it vibrates.
        if (hs > 0) {
          const hx = px - lx0;
          const hy = py - ly0;
          const hd2 = hx * hx + hy * hy;
          if (hd2 < HOLD_REACH * HOLD_REACH) {
            const hd = Math.sqrt(hd2);
            const hg = 1 - hd / HOLD_REACH;
            const push = hg * hg * (0.5 + 0.3 * held) * hs;
            sx -= hx * push;
            sy -= hy * push;
            if (vib > 0) {
              // Fast tremor, strongest around the hole.
              sx += Math.sin(shake * 190 + py * 0.9) * hg * hg * 6 * vib;
              sy += Math.cos(shake * 170 + px * 0.8) * hg * hg * 6 * vib;
            }
            const hr = HOLD_RADIUS * hs * (0.8 + 0.5 * held) * (1 + 0.1 * vib * Math.sin(shake * 120));
            holeMul = smooth(clamp01((hd - hr * 0.35) / (hr * 0.65 + 1)));
          }
        }

        // Ripples: a ring of displacement and density travelling outward.
        let wave = 0;
        for (let i = 0; i < rips.length; i++) {
          const r = rips[i];
          const rx = px - r.x;
          const ry = py - r.y;
          const rd2 = rx * rx + ry * ry;
          const lo = r.rad - reach;
          const hi = r.rad + reach;
          if (rd2 > hi * hi || (lo > 0 && rd2 < lo * lo)) continue;
          const rd = Math.sqrt(rd2) || 1;
          const w = (rd - r.rad) / RIPPLE_WIDTH;
          const env = Math.exp(-w * w) * r.amp;
          const bend = env * Math.cos(w * 2.4) * 12;
          sx -= (rx / rd) * bend;
          sy -= (ry / rd) * bend;
          wave += env;
        }

        const cx = sx / UNIT_X;
        const cy = sy / UNIT;
        const dx = (sx - fcx) / UNIT;
        const dy = (sy - fcy) / UNIT;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let f = 0;
        if (k < 1) {
          f = FA.a.sample(cx, cy, dist, dx, dy, fctx);
          if (FA.w > 0) f = lerp(f, FA.b.sample(cx, cy, dist, dx, dy, fctx), FA.w);
        }
        if (k > 0) {
          let g = FB.a.sample(cx, cy, dist, dx, dy, fctx);
          if (FB.w > 0) g = lerp(g, FB.b.sample(cx, cy, dist, dx, dy, fctx), FB.w);
          f = k < 1 ? lerp(f, g, k) : g;
        }
        f = clamp01((f + 1) / 2);

        let m = 0;
        if (hasShape) {
          // The lens only bends the shape as much as the state allows.
          let u = (px + (sx - px) * warpAmt - sqX) / side;
          let v = (py + (sy - py) * warpAmt - sqY) / side;
          // Living shape: the field gently pushes the sampling point around.
          if (warp > 0) {
            u += warp * Math.sin(v * 9 + t * 2.1) + (f - 0.5) * 0.022 * warpAmt;
            v += warp * Math.cos(u * 8 - t * 1.6);
          }
          if (scat > 0) {
            u += scat * Math.sin(cy * 0.31 + t * 5.1) * Math.cos(cx * 0.17 - t * 2.9);
            v += scat * Math.cos(cx * 0.23 + t * 4.3) * Math.sin(cy * 0.19 + t * 2.2);
          }
          if (melt) {
            const d = lerp(sample(sA!.sdf!, sA!.size, u, v, 64), sample(sB!.sdf!, sB!.size, u, v, 64), ks);
            const e = clamp01((1.4 - d) / 2.8);
            m = e * e * (3 - 2 * e);
            if (shA || shB) {
              const a = shA ? sample(shA, sA!.size, u, v, 0) : 1;
              const b = shB ? sample(shB, sB!.size, u, v, 0) : 1;
              m *= lerp(a, b, ks);
            }
          } else {
            if (sA && wA > 0) m += sample(sA.tone, sA.size, u, v, 0) * wA;
            if (sB && wB > 0) m += sample(sB.tone, sB.size, u, v, 0) * wB;
          }
          m *= 1 - 0.5 * scatter;
        }

        const light = f * ambient * fieldMax;
        // Low texture: the image's own shading drives the ink, the field only grains it.
        const dense = 0.5 + 0.5 * (0.7 + (f - 0.7) * texture);
        let val = ell * (light + (dense - light) * m) * intensity * holeMul + ell * (wave * 0.4 + lens * 0.3);
        let ink = m > 0.28 || val > accentT || wave * ell > 0.25 ? 1 : 0;
        if (front > 0) {
          const fv = front * front * (0.65 + 0.35 * f);
          if (fv > val) {
            val = fv;
            ink = 1;
          }
        }

        if (val <= 0) continue;
        const q = (val >= 1 ? 0.9999 : val) * DLEN;
        const gi = q | 0;
        if (gi === 0) continue;
        const fr = q - gi;
        const ai = fr < 0.34 ? 0 : fr < 0.67 ? 1 : 2;
        const b = ink * NA + ai;
        buckets[b][x] = DENSITY[gi];
        used[b] = 1;
      }
      for (let b = 0; b < NB; b++) {
        if (!used[b]) continue;
        const row = buckets[b];
        ctx.fillStyle = this.bucketStyle[b];
        ctx.fillText(row.join(""), 0, y * ch);
        row.fill(" ");
      }
    }
  }
}
