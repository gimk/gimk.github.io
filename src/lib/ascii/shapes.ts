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

/** Luminance + subject matte of an image, cover-fitted into a square buffer. */
export interface ImageSample {
  size: number;
  /** 0..1 luminance. */
  lum: Float32Array;
  /** 0..1 subject coverage: 0 on the keyed-out backdrop. */
  alpha: Float32Array;
}

/**
 * Sample an image into a square buffer. The backdrop colour is estimated from
 * the top edge and keyed out by colour distance, so a plain studio backdrop
 * (of any brightness) gets no ink and only the subject is drawn.
 */
export function imageSample(
  src: CanvasImageSource & { width: number; height: number },
  opts: { crop?: { x: number; y: number; w: number } } = {},
  size = SHAPE_SIZE,
): ImageSample {
  const { ctx } = makeCanvas(size);
  const w = (src as HTMLImageElement).naturalWidth || src.width;
  const h = (src as HTMLImageElement).naturalHeight || src.height;
  if (opts.crop) {
    // Square crop, in fractions of the source width (x, w) and height (y).
    const cw = opts.crop.w * w;
    ctx.drawImage(src, opts.crop.x * w, opts.crop.y * h, cw, cw, 0, 0, size, size);
  } else {
    const s = Math.max(size / w, size / h);
    const dw = w * s;
    const dh = h * s;
    // Bias the crop upward: portraits keep the face, lose the bottom.
    ctx.drawImage(src, (size - dw) / 2, Math.min(0, (size - dh) * 0.3), dw, dh);
  }
  const px = ctx.getImageData(0, 0, size, size).data;
  const n = size * size;

  // Backdrop: median-ish average of the top row and the top of both sides.
  let br = 0, bg = 0, bb = 0, cnt = 0;
  const addPx = (i: number) => {
    if (px[i * 4 + 3] < 10) return;
    br += px[i * 4];
    bg += px[i * 4 + 1];
    bb += px[i * 4 + 2];
    cnt++;
  };
  for (let x = 0; x < size; x++) addPx(x);
  for (let y = 0; y < size * 0.5; y++) {
    addPx(y * size);
    addPx(y * size + size - 1);
  }
  const keyed = cnt > 0;
  let kr = 0, kg = 0, kb = 0;
  if (keyed) {
    const bs = br + bg + bb + 1;
    kr = br / bs;
    kg = bg / bs;
    kb = bb / bs;
  }

  const lum = new Float32Array(n);
  const alpha = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
    const a = px[i * 4 + 3] / 255;
    lum[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    let k = 1;
    if (keyed) {
      // Compare chromaticity, not raw colour, so the backdrop's light falloff
      // doesn't matter. Very dark pixels have unreliable hue: keep them.
      const sum = r + g + b + 1;
      const dr = r / sum - kr, dg = g / sum - kg, db = b / sum - kb;
      const d = Math.sqrt(dr * dr + dg * dg + db * db);
      const t = Math.min(1, Math.max(0, (d - 0.035) / 0.05));
      k = t * t * (3 - 2 * t);
      if (lum[i] < 0.12) k = 1;
    }
    alpha[i] = a * k;
  }
  // Clean the matte: a 3×3 blur removes speckle along the edges.
  const out = new Float32Array(n);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sum = 0, c = 0;
      for (let oy = -1; oy <= 1; oy++) {
        const yy = y + oy;
        if (yy < 0 || yy >= size) continue;
        for (let ox = -1; ox <= 1; ox++) {
          const xx = x + ox;
          if (xx < 0 || xx >= size) continue;
          sum += alpha[yy * size + xx];
          c++;
        }
      }
      out[y * size + x] = sum / c;
    }
  }
  // Equalise luminance over the subject so features use the full glyph range.
  const vals: number[] = [];
  for (let i = 0; i < n; i++) if (out[i] > 0.5) vals.push(lum[i]);
  if (vals.length > 32) {
    vals.sort((a, b) => a - b);
    const last = vals.length - 1;
    for (let i = 0; i < n; i++) {
      let lo = 0, hi = last;
      const v = lum[i];
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (vals[mid] < v) lo = mid + 1;
        else hi = mid;
      }
      lum[i] = lo / last;
    }
  }
  return { size, lum, alpha: out };
}

export interface ImageShapeOptions {
  /** true when glyphs are light on dark (dark theme): bright pixels get dense glyphs. */
  lightInk: boolean;
  /** Contrast around mid-grey, 1 = unchanged. */
  contrast?: number;
  /** Minimum ink anywhere on the subject, so light areas keep the silhouette. */
  floor?: number;
  /** Feather the bottom edge so the bust melts into the field. */
  fadeBottom?: number;
}

export function imageShape(img: ImageSample, opts: ImageShapeOptions): ShapeBuffer {
  const { lightInk, contrast = 1.6, floor = 0.3, fadeBottom = 0.22 } = opts;
  const { size, lum, alpha } = img;
  const tone = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    const ny = (y + 0.5) / size;
    const fb = fadeBottom > 0 ? Math.min(1, Math.max(0, (1 - ny) / fadeBottom)) : 1;
    const bottom = fb * fb * (3 - 2 * fb);
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const a = alpha[i];
      if (a < 0.01) continue;
      let v = lightInk ? lum[i] : 1 - lum[i];
      v = Math.min(1, Math.max(0, (v - 0.5) * contrast + 0.5));
      tone[i] = a * bottom * (floor + (1 - floor) * v);
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
