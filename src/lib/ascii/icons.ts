/**
 * Project icons for the ASCII canvas. Bold, solid silhouettes painted in white
 * on a transparent square canvas; cutouts use destination-out. All geometry is
 * relative to `size`. Each icon spans roughly 70-80% of the canvas, centred.
 */
import type { IconDrawer } from "./types";

const WHITE = "#fff";

function rr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Wrap a drawer body with state save/restore and a composite reset. */
function icon(body: (ctx: CanvasRenderingContext2D, s: number) => void): IconDrawer {
  return (ctx, s) => {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = WHITE;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    body(ctx, s);
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  };
}

const comp = icon((ctx, s) => {
  const w = 0.28 * s;
  const h = 0.24 * s;
  const r = 0.06 * s;
  const lx = 0.12 * s;
  const rx = 0.6 * s;
  const ay = 0.16 * s;
  const by = 0.6 * s;
  const cy = 0.38 * s;

  ctx.lineWidth = 0.07 * s;
  const wire = (y0: number) => {
    ctx.beginPath();
    ctx.moveTo(lx + w, y0);
    ctx.bezierCurveTo(0.52 * s, y0, 0.48 * s, 0.5 * s, rx, 0.5 * s);
    ctx.stroke();
  };
  wire(ay + h / 2);
  wire(by + h / 2);

  rr(ctx, lx, ay, w, h, r);
  ctx.fill();
  rr(ctx, lx, by, w, h, r);
  ctx.fill();
  rr(ctx, rx, cy, w, h, r);
  ctx.fill();
});

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const dither = icon((ctx, s) => {
  const n = 6;
  const total = 0.76 * s;
  const cell = total / n;
  const x0 = (s - total) / 2;
  const inset = cell * 0.07;
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const d = 1 - (i + j * 0.45) / (n - 1 + (n - 1) * 0.45);
      const threshold = (BAYER4[j % 4][i % 4] + 0.5) / 16;
      // Keep the first column fully solid so the silhouette stays square-ish.
      if (i === 0 || d > threshold) {
        ctx.fillRect(
          x0 + i * cell + inset,
          x0 + j * cell + inset,
          cell - inset * 2,
          cell - inset * 2,
        );
      }
    }
  }
});

const colors = icon((ctx, s) => {
  // A fan of five swatches opening upward from a pivot near the bottom.
  const px = 0.5 * s;
  const py = 0.88 * s;
  const r0 = 0.12 * s;
  const r1 = 0.68 * s;
  const w = 0.14 * s;
  const step = (16 * Math.PI) / 180;
  for (let k = -2; k <= 2; k++) {
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(k * step);
    rr(ctx, -w / 2, -r1, w, r1 - r0, w * 0.4);
    ctx.fill();
    ctx.restore();
  }
});

const photo = icon((ctx, s) => {
  const c = s / 2;
  // Outer ring.
  ctx.lineWidth = 0.08 * s;
  ctx.beginPath();
  ctx.arc(c, c, 0.34 * s, 0, Math.PI * 2);
  ctx.stroke();
  // Aperture disc.
  ctx.beginPath();
  ctx.arc(c, c, 0.25 * s, 0, Math.PI * 2);
  ctx.fill();
  // Blade cuts + central hexagon.
  ctx.globalCompositeOperation = "destination-out";
  ctx.lineWidth = 0.05 * s;
  ctx.lineCap = "butt";
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const b = a + (45 * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(a) * 0.1 * s, c + Math.sin(a) * 0.1 * s);
    ctx.lineTo(c + Math.cos(b) * 0.27 * s, c + Math.sin(b) * 0.27 * s);
    ctx.stroke();
  }
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const x = c + Math.cos(a) * 0.1 * s;
    const y = c + Math.sin(a) * 0.1 * s;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
});

const bankin = icon((ctx, s) => {
  ctx.translate(s / 2, s / 2);
  ctx.rotate(-0.2);
  const w = 0.72 * s;
  const h = 0.48 * s;
  rr(ctx, -w / 2, -h / 2, w, h, 0.07 * s);
  ctx.fill();
  ctx.globalCompositeOperation = "destination-out";
  // Chip.
  rr(ctx, -0.28 * s, -0.15 * s, 0.18 * s, 0.14 * s, 0.03 * s);
  ctx.fill();
  // Stripe.
  ctx.fillRect(-0.28 * s, 0.07 * s, 0.56 * s, 0.08 * s);
});

const coach = icon((ctx, s) => {
  rr(ctx, 0.12 * s, 0.16 * s, 0.76 * s, 0.54 * s, 0.14 * s);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0.26 * s, 0.62 * s);
  ctx.lineTo(0.22 * s, 0.88 * s);
  ctx.lineTo(0.52 * s, 0.62 * s);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = "destination-out";
  for (const x of [0.32, 0.5, 0.68]) {
    ctx.beginPath();
    ctx.arc(x * s, 0.43 * s, 0.06 * s, 0, Math.PI * 2);
    ctx.fill();
  }
});

const blank = icon((ctx, s) => {
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, 0.38 * s, 0, Math.PI * 2);
  ctx.fill();
});

export const ICONS: Record<string, IconDrawer> = {
  comp,
  dither,
  colors,
  photo,
  bankin,
  coach,
  blank,
};
