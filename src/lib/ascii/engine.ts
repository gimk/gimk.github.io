import { FIELDS } from "./fields";
import type { AsciiState, Field, FieldCtx, Rect, ShapeBuffer } from "./types";

const DENSITY = " .:-=+*#%@";
const DLEN = DENSITY.length;
/** Old code scaled dx by this to correct for glyph aspect. */
const ASPECT = 0.875;

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  fontSize?: number;
  fps?: number;
}

interface Reveal {
  x: number; // css px
  y: number;
  start: number; // ms
  speed: number; // css px per second
  front: number; // wavefront width in css px
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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
 * Renders a full-viewport ASCII grid. The page drives it with `progress`, a
 * float index into `states`: 2.4 means 60% state 2 / 40% state 3.
 */
export class AsciiEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private fontSize: number;
  private frameMs: number;
  private cellW = 7;
  private cellH = 9;
  private cols = 0;
  private rows = 0;
  private dpr = 1;
  private shapes = new Map<string, ShapeBuffer>();
  private fieldCache = new Map<string, Field>();
  private states: AsciiState[] = [];
  private raf = 0;
  private last = 0;
  private t = 0;
  private reveal: Reveal | null = null;
  private trail: { x: number; y: number; age: number }[] = [];
  private color = "rgba(249,115,22,0.8)";
  private running = false;
  private staticFrame = false;
  private row: string[] = [];

  progress = 0;

  constructor(opts: EngineOptions) {
    this.canvas = opts.canvas;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    this.ctx = ctx;
    this.fontSize = opts.fontSize ?? 10;
    this.frameMs = 1000 / (opts.fps ?? 24);
    this.staticFrame = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.onResize = this.onResize.bind(this);
    this.onPointer = this.onPointer.bind(this);
    this.tick = this.tick.bind(this);
    this.onVisibility = this.onVisibility.bind(this);
  }

  get reducedMotion() {
    return this.staticFrame;
  }

  setShape(key: string, buf: ShapeBuffer) {
    this.shapes.set(key, buf);
  }

  setStates(states: AsciiState[]) {
    this.states = states;
  }

  /** Ink colour, e.g. from the theme's accent. */
  setColor(css: string) {
    this.color = css;
  }

  /** Start the circular wave that uncovers the grid from a point (CSS px). */
  startReveal(x: number, y: number, speed = 1400, front = 90) {
    this.reveal = { x, y, start: performance.now(), speed, front };
  }

  get revealDone() {
    return this.reveal === null;
  }

  start() {
    if (this.running) return;
    this.running = true;
    addEventListener("resize", this.onResize);
    addEventListener("pointermove", this.onPointer, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
    this.onResize();
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    removeEventListener("resize", this.onResize);
    removeEventListener("pointermove", this.onPointer);
    document.removeEventListener("visibilitychange", this.onVisibility);
  }

  private onVisibility() {
    if (document.hidden) cancelAnimationFrame(this.raf);
    else if (this.running) this.raf = requestAnimationFrame(this.tick);
  }

  private onResize() {
    this.dpr = Math.min(2, devicePixelRatio || 1);
    const w = innerWidth;
    const h = innerHeight;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.font = `${this.fontSize}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textBaseline = "top";
    this.cellW = ctx.measureText("M").width;
    this.cellH = Math.round(this.fontSize * 0.95);
    this.cols = Math.ceil(w / this.cellW);
    this.rows = Math.ceil(h / this.cellH);
    this.row = new Array(this.cols);
  }

  private onPointer(e: PointerEvent) {
    if (this.staticFrame) return;
    this.trail.push({ x: e.clientX / this.cellW, y: e.clientY / this.cellH, age: 1 });
    if (this.trail.length > 60) this.trail.shift();
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
    if (now - this.last < this.frameMs) return;
    this.last = now;
    this.draw(now);
    if (!this.staticFrame) this.t += 0.02;
  }

  /** Render one frame. Public so reduced-motion pages can repaint on scroll. */
  draw(now = performance.now()) {
    const n = this.states.length;
    if (!n || !this.cols) return;
    const p = Math.min(n - 1, Math.max(0, this.progress));
    const i = Math.min(n - 2, Math.floor(p));
    const A = this.states[Math.max(0, i)];
    const B = n > 1 ? this.states[i + 1] : A;
    const k = n > 1 ? smooth(clamp01(p - i)) : 0;

    const fA = this.field(A.field);
    const fB = this.field(B.field);
    const fctx: FieldCtx = { t: this.t, cols: this.cols, rows: this.rows };
    fA.prepare?.(fctx);
    if (fB !== fA) fB.prepare?.(fctx);

    const sA = A.shape ? this.shapes.get(A.shape) : undefined;
    const sB = B.shape ? this.shapes.get(B.shape) : undefined;
    const sdfBlend = !!(sA?.sdf && sB?.sdf);

    const rA = A.frame();
    const rB = B.frame();
    const r = lerpRect(rA, rB, k);
    const intensity = lerp(A.intensity, B.intensity, k);
    const ambient = lerp(A.ambient, B.ambient, k);
    const shapeScale = lerp(A.shapeScale ?? 0.8, B.shapeScale ?? 0.8, k);
    // Shape weight per side: a null shape contributes nothing.
    const wA = sA ? 1 - k : 0;
    const wB = sB ? k : 0;

    // Square shape area, centred in the frame (shapes are square buffers).
    const side = Math.min(r.w, r.h) * shapeScale;
    const sqX = r.x + (r.w - side) / 2;
    const sqY = r.y + (r.h - side) / 2;
    const fcx = (r.x + r.w / 2) / this.cellW;
    const fcy = (r.y + r.h / 2) / this.cellH;
    // Elliptical mask inscribed in the frame, with a soft rim.
    const ecx = r.x + r.w / 2;
    const ecy = r.y + r.h / 2;
    const erx = Math.max(1, r.w / 2);
    const ery = Math.max(1, r.h / 2);
    const rim = 0.3;

    // Reveal wave
    let rv = Infinity;
    let rvFront = 1;
    const rev = this.reveal;
    if (rev) {
      if (this.staticFrame) {
        this.reveal = null;
      } else {
        rv = ((now - rev.start) / 1000) * rev.speed;
        rvFront = rev.front;
        if (rv > Math.hypot(innerWidth, innerHeight) + rev.front) this.reveal = null;
      }
    }

    // Age trail
    const trail = this.trail;
    for (let j = trail.length - 1; j >= 0; j--) {
      trail[j].age -= 0.035;
      if (trail[j].age <= 0) trail.splice(j, 1);
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.fillStyle = this.color;
    const cw = this.cellW;
    const ch = this.cellH;
    const row = this.row;

    for (let y = 0; y < this.rows; y++) {
      const py = (y + 0.5) * ch;
      let any = false;
      for (let x = 0; x < this.cols; x++) {
        const px = (x + 0.5) * cw;

        // Ellipse mask: the field fills the frame, fading out towards the rim.
        const enx = (px - ecx) / erx;
        const eny = (py - ecy) / ery;
        const er = Math.sqrt(enx * enx + eny * eny);
        const ell = er >= 1 ? 0 : smooth(clamp01((1 - er) / rim));

        // Shape mask
        let m = 0;
        if (wA + wB > 0) {
          const u = (px - sqX) / side;
          const v = (py - sqY) / side;
          if (sdfBlend) {
            const d = lerp(sample(sA!.sdf!, sA!.size, u, v, 64), sample(sB!.sdf!, sB!.size, u, v, 64), k);
            // Edge softness in buffer px, converted from SDF units (buffer px).
            const t = clamp01((1.2 - d) / 2.4);
            m = t * t * (3 - 2 * t);
          } else {
            if (sA) m += sample(sA.tone, sA.size, u, v, 0) * wA;
            if (sB) m += sample(sB.tone, sB.size, u, v, 0) * wB;
          }
        }

        // Pointer trail
        let tr = 0;
        for (let j = 0; j < trail.length; j++) {
          const p0 = trail[j];
          const ddx = (x - p0.x) * ASPECT;
          const ddy = y - p0.y;
          const dd = ddx * ddx + ddy * ddy;
          if (dd < 9) tr += (1 - Math.sqrt(dd) / 3) * p0.age * 0.45;
        }

        if (ell < 0.004 && tr < 0.01) {
          row[x] = " ";
          continue;
        }

        const dx = (x - fcx) * ASPECT;
        const dy = y - fcy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let f = fA.sample(x, y, dist, dx, dy, fctx);
        if (fB !== fA) f = lerp(f, fB.sample(x, y, dist, dx, dy, fctx), k);
        f = clamp01((f + 1) / 2);

        // The field fills the ellipse in light glyphs; the shape is suggested by
        // pushing its area into the dense end of the ramp (same motion, darker ink).
        const light = f * ambient * 0.5;
        const dense = 0.5 + 0.5 * f;
        let val = ell * (light + (dense - light) * m);
        val = val * intensity + tr;

        if (rv !== Infinity) {
          const d = Math.hypot(px - rev!.x, py - rev!.y);
          if (d > rv) val = 0;
          else if (d > rv - rvFront) {
            const fr = 1 - (rv - d) / rvFront; // 1 at the leading edge
            val = Math.max(val, fr * fr * 0.9 * (0.6 + 0.4 * f));
          }
        }

        let ci = (val * DLEN) | 0;
        if (ci < 0) ci = 0;
        else if (ci >= DLEN) ci = DLEN - 1;
        row[x] = DENSITY[ci];
        if (ci) any = true;
      }
      if (any) ctx.fillText(row.join(""), 0, y * ch);
    }
  }
}
