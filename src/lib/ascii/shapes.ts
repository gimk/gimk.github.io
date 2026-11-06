import type { IconDrawer, ShapeBuffer } from "./types";

/** Resolution of every shape buffer. Shapes are sampled bilinearly, so this only needs to beat the cell grid. */
export const SHAPE_SIZE = 128;

const INF = 1e20;

/** Felzenszwalb 1D squared distance transform (in place on `f`, using scratch arrays). */
function edt1d(f: Float64Array, n: number, d: Float64Array, v: Int32Array, z: Float64Array) {
  let k = 0;
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const dq = q - v[k];
    d[q] = dq * dq + f[v[k]];
  }
}

/** Euclidean distance (not squared) to the nearest cell where `inside(i)` is true. */
function edt2d(size: number, isFeature: (i: number) => boolean): Float32Array {
  const grid = new Float64Array(size * size);
  for (let i = 0; i < grid.length; i++) grid[i] = isFeature(i) ? 0 : INF;
  const f = new Float64Array(size);
  const d = new Float64Array(size);
  const v = new Int32Array(size);
  const z = new Float64Array(size + 1);
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) f[y] = grid[y * size + x];
    edt1d(f, size, d, v, z);
    for (let y = 0; y < size; y++) grid[y * size + x] = d[y];
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) f[x] = grid[y * size + x];
    edt1d(f, size, d, v, z);
    for (let x = 0; x < size; x++) grid[y * size + x] = d[x];
  }
  const out = new Float32Array(size * size);
  for (let i = 0; i < out.length; i++) out[i] = Math.sqrt(grid[i]);
  return out;
}

function makeCanvas(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2d context unavailable");
  return { c, ctx };
}

/** SDF edge softness in buffer pixels. */
export const SDF_EDGE = 1.2;

export function toneFromSdf(sd: number): number {
  const t = Math.min(1, Math.max(0, (SDF_EDGE - sd) / (2 * SDF_EDGE)));
  return t * t * (3 - 2 * t);
}

/** Rasterise an icon drawer into a tone buffer + signed distance field. */
export function iconShape(draw: IconDrawer, size = SHAPE_SIZE): ShapeBuffer {
  const { ctx } = makeCanvas(size);
  draw(ctx, size);
  const alpha = ctx.getImageData(0, 0, size, size).data;
  const inside = (i: number) => alpha[i * 4 + 3] > 127;
  const dOut = edt2d(size, inside);
  const dIn = edt2d(size, (i) => !inside(i));
  const sdf = new Float32Array(size * size);
  const tone = new Float32Array(size * size);
  for (let i = 0; i < sdf.length; i++) {
    // Pixel centres: shift by half a pixel so the edge sits between in/out cells.
    sdf[i] = dOut[i] > 0 ? dOut[i] - 0.5 : -(dIn[i] - 0.5);
    tone[i] = toneFromSdf(sdf[i]);
  }
  return { size, tone, sdf };
}

export interface ImageShapeOptions {
  /** true when glyphs are light on dark (dark theme): bright pixels get dense glyphs. */
  lightInk: boolean;
  /** Contrast around mid-grey, 1 = unchanged. */
  contrast?: number;
  /** Gamma on the final tone. */
  gamma?: number;
  /** Feather the buffer edges with a soft oval so the image melts into the field. */
  vignette?: number;
}

/** Luminance (0..1) of an image, cover-fitted into a square buffer. */
export function imageLuminance(src: CanvasImageSource & { width: number; height: number }, size = SHAPE_SIZE): Float32Array {
  const { ctx } = makeCanvas(size);
  const w = (src as HTMLImageElement).naturalWidth || src.width;
  const h = (src as HTMLImageElement).naturalHeight || src.height;
  const s = Math.max(size / w, size / h);
  const dw = w * s;
  const dh = h * s;
  // Bias crop upward a little: portraits keep the face, lose the bottom.
  ctx.drawImage(src, (size - dw) / 2, Math.min(0, (size - dh) * 0.3), dw, dh);
  const px = ctx.getImageData(0, 0, size, size).data;
  const lum = new Float32Array(size * size);
  for (let i = 0; i < lum.length; i++) {
    const a = px[i * 4 + 3] / 255;
    const l = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
    // Transparent pixels count as background: no ink in either theme.
    lum[i] = a < 0.01 ? -1 : l;
  }
  return lum;
}

export function imageShape(lum: Float32Array, opts: ImageShapeOptions, size = SHAPE_SIZE): ShapeBuffer {
  const { lightInk, contrast = 1.4, gamma = 1, vignette = 0.35 } = opts;
  const tone = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      if (lum[i] < 0) {
        tone[i] = 0;
        continue;
      }
      let v = lightInk ? lum[i] : 1 - lum[i];
      v = (v - 0.5) * contrast + 0.5;
      v = Math.min(1, Math.max(0, v));
      if (gamma !== 1) v = Math.pow(v, gamma);
      if (vignette > 0) {
        const nx = (x + 0.5) / size - 0.5;
        const ny = (y + 0.5) / size - 0.5;
        const r = Math.sqrt(nx * nx * 1.3 + ny * ny) * 2; // 0 centre, ~1 edge
        const edge = Math.min(1, Math.max(0, (1 - r) / vignette));
        v *= edge * edge * (3 - 2 * edge);
      }
      tone[i] = v;
    }
  }
  return { size, tone };
}

/**
 * Stand-in portrait until a real photo exists at /portrait.jpg:
 * a lit head-and-shoulders bust, drawn with gradients so it has real tones.
 */
export function placeholderPortrait(size = 256): HTMLCanvasElement {
  const { c, ctx } = makeCanvas(size);
  const s = size;
  // Background stays transparent (no ink).
  const light = (x: number, y: number, r: number) => {
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r * 1.1);
    g.addColorStop(0, "#f2f2f2");
    g.addColorStop(0.55, "#9a9a9a");
    g.addColorStop(1, "#262626");
    return g;
  };
  // Shoulders
  ctx.fillStyle = light(s * 0.5, s * 0.95, s * 0.45);
  ctx.beginPath();
  ctx.ellipse(s * 0.5, s * 1.02, s * 0.42, s * 0.3, 0, Math.PI, 0);
  ctx.fill();
  // Neck
  ctx.fillStyle = "#5a5a5a";
  ctx.fillRect(s * 0.43, s * 0.58, s * 0.14, s * 0.16);
  // Head
  ctx.fillStyle = light(s * 0.5, s * 0.42, s * 0.2);
  ctx.beginPath();
  ctx.ellipse(s * 0.5, s * 0.42, s * 0.16, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hair cap
  ctx.fillStyle = "#1c1c1c";
  ctx.beginPath();
  ctx.ellipse(s * 0.5, s * 0.3, s * 0.17, s * 0.11, 0, Math.PI, 0);
  ctx.fill();
  return c;
}
