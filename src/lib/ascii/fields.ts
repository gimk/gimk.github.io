/**
 * ASCII motion fields — pure ports of the animations from HeroAscii.astro.
 * Each factory returns an independent instance (state lives in its closure).
 * `sample` never allocates.
 */
import type { Field, FieldCtx, FieldFactory } from "./types";

const wave: FieldFactory = () => ({
  name: "wave",
  sample(_x, _y, dist, dx, dy, ctx) {
    const time = ctx.t;
    return (
      Math.sin(dist * 0.12 - time) * 0.6 +
      Math.cos(dx * 0.08 + time * 0.5) * 0.2 +
      Math.sin(dy * 0.08 + time * 0.5) * 0.2
    );
  },
});

/** Quiet variant of wave for sitting behind reading text. */
const calm: FieldFactory = () => ({
  name: "calm",
  sample(_x, _y, dist, dx, dy, ctx) {
    const time = ctx.t * 0.4;
    return (
      (Math.sin(dist * 0.12 - time) * 0.6 +
        Math.cos(dx * 0.08 + time * 0.5) * 0.2 +
        Math.sin(dy * 0.08 + time * 0.5) * 0.2) *
      0.35
    );
  },
});

const cells: FieldFactory = () => {
  const NUM_WAVES = 12;
  const CYCLE = 5.0;
  // Flat preallocated storage: [rx, ry, fade] per wave.
  const waves = new Float64Array(NUM_WAVES * 3);
  let ready = false;

  const field: Field = {
    name: "cells",
    prepare(ctx: FieldCtx) {
      const { t: time, cols, rows } = ctx;
      for (let i = 0; i < NUM_WAVES; i++) {
        const t = time * 0.5 + i * (CYCLE / NUM_WAVES);
        const phase = t % CYCLE;
        const cycleIdx = Math.floor(t / CYCLE);
        const seed = i + cycleIdx * 987.65;
        const s = Math.sin((phase / CYCLE) * Math.PI);
        waves[i * 3] = Math.sin(seed * 7.4) * (cols * 0.45);
        waves[i * 3 + 1] = Math.cos(seed * 4.2) * (rows * 0.45);
        waves[i * 3 + 2] = s * s;
      }
      ready = true;
    },
    sample(_x, _y, _dist, dx, dy, ctx) {
      if (!ready) return 0;
      const time = ctx.t;
      let val = 0;
      for (let i = 0; i < NUM_WAVES; i++) {
        const adx = dx - waves[i * 3];
        const ady = dy - waves[i * 3 + 1];
        const d = Math.sqrt(adx * adx + ady * ady);
        val += Math.sin(d * 0.4 - time * 4) * waves[i * 3 + 2] * 0.3;
      }
      val += Math.cos(dx * 0.1 + time) * 0.1;
      val += Math.sin(dy * 0.1 + time) * 0.1;
      return val - 0.1;
    },
  };
  return field;
};

const vortex: FieldFactory = () => ({
  name: "vortex",
  sample(_x, _y, dist, dx, dy, ctx) {
    const time = ctx.t;
    const angle = Math.atan2(dy, dx);
    return (
      Math.sin(dist * 0.15 - time * 2 + angle * 3) * 0.7 +
      Math.cos(dx * 0.05 + time) * 0.3
    );
  },
});

const grid: FieldFactory = () => ({
  name: "grid",
  sample(x, y, dist, _dx, _dy, ctx) {
    const time = ctx.t;
    return (
      Math.sin(x * 0.15 + time) * 0.4 +
      Math.cos(y * 0.15 + time) * 0.4 +
      Math.sin(dist * 0.05 - time) * 0.2
    );
  },
});

const tunnel: FieldFactory = () => ({
  name: "tunnel",
  sample(_x, _y, dist, dx, dy, ctx) {
    const time = ctx.t;
    return (
      Math.sin(40 / (dist + 5) - time * 1.5) * 0.8 +
      Math.sin(Math.atan2(dy, dx) * 5 + time * 0.5) * 0.2
    );
  },
});

const interference: FieldFactory = () => ({
  name: "interference",
  sample(_x, _y, _dist, dx, dy, ctx) {
    const time = ctx.t;
    const a1 = dx - 25;
    const b1 = dy - 10;
    const a2 = dx + 25;
    const b2 = dy + 10;
    const d1 = Math.sqrt(a1 * a1 + b1 * b1);
    const d2 = Math.sqrt(a2 * a2 + b2 * b2);
    return (
      (Math.sin(d1 * 0.15 - time * 2) + Math.sin(d2 * 0.15 - time * 2)) * 0.5
    );
  },
});

const plasma: FieldFactory = () => ({
  name: "plasma",
  sample(_x, _y, dist, dx, dy, ctx) {
    const time = ctx.t;
    const v1 = Math.sin(dx * 0.1 + time);
    const v2 = Math.sin(dy * 0.1 + time * 0.5);
    const v3 = Math.sin((dx + dy) * 0.1 + time);
    // sqrt(dx*dx+dy*dy) is exactly `dist`.
    const v4 = Math.sin(dist * 0.1 + 1);
    return (v1 + v2 + v3 + v4) * 0.25;
  },
});

const rings: FieldFactory = () => ({
  name: "rings",
  sample(_x, _y, dist, dx, dy, ctx) {
    const time = ctx.t;
    const centerIntensity = 12 / (dist + 3);
    const r1 = Math.abs(dist - (30 + Math.sin(time) * 5));
    const r2 = Math.abs(dist - (45 + Math.cos(time * 0.5) * 8));
    const angle = Math.atan2(dy, dx);
    const ring1 =
      (2 / (r1 + 1)) * (Math.sin(angle * 2 + time * 2) * 0.5 + 0.5);
    const ring2 = (2 / (r2 + 1)) * (Math.cos(angle * 3 - time) * 0.5 + 0.5);
    return centerIntensity + ring1 + ring2 - 0.8;
  },
});

const solar: FieldFactory = () => ({
  name: "solar",
  sample(x, y, dist, dx, dy, ctx) {
    const time = ctx.t;
    const sunPulse = Math.sin(time * 2) * 2;
    const sunIntensity = (12 + sunPulse) / (dist + 3);

    const p1x = Math.cos(time * 1.5) * 20;
    const p1y = Math.sin(time * 1.5) * 12;
    const a1 = dx - p1x;
    const b1 = dy - p1y;
    const d1 = Math.sqrt(a1 * a1 + b1 * b1);
    const p1Intensity = 8 / (d1 + 2);

    const p2x = Math.cos(time * 0.8) * 40;
    const p2y = Math.sin(time * 0.8) * 24;
    const a2 = dx - p2x;
    const b2 = dy - p2y;
    const d2 = Math.sqrt(a2 * a2 + b2 * b2);

    const m1x = p2x + Math.cos(time * 3) * 6;
    const m1y = p2y + Math.sin(time * 3) * 4;
    const am = dx - m1x;
    const bm = dy - m1y;
    const dm1 = Math.sqrt(am * am + bm * bm);

    const p2Intensity = 10 / (d2 + 3) + 5 / (dm1 + 1.5);

    const p3x = Math.cos(time * 0.4 + 3) * 65;
    const p3y = Math.sin(time * 0.4 + 3) * 38;
    const a3 = dx - p3x;
    const b3 = dy - p3y;
    const d3 = Math.sqrt(a3 * a3 + b3 * b3);
    const p3Intensity = 12 / (d3 + 4);

    const stars = Math.sin(x * 123.45) * Math.cos(y * 543.21) > 0.99 ? 0.15 : 0;

    return (
      sunIntensity + p2Intensity + p1Intensity + p3Intensity + stars - 1.1
    );
  },
});

export const FIELDS: Record<string, FieldFactory> = {
  wave,
  cells,
  vortex,
  grid,
  tunnel,
  interference,
  plasma,
  rings,
  solar,
  calm,
};

