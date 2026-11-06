/**
 * ASCII engine — shared types.
 *
 * One fixed full-viewport canvas renders a character grid. What it shows is
 * described by a list of `AsciiState`s; the engine always interpolates between
 * two neighbouring states (motion field, shape, frame, intensity), so every
 * change on the page is a blend, never a cut.
 *
 * The canvas is illustration only: all text on the page stays real HTML text.
 */

/** Per-frame context passed to fields. Coordinates are grid cells. */
export interface FieldCtx {
  /** Seconds-ish animation clock (advances ~0.02 per frame at 24fps, like the old code). */
  t: number;
  cols: number;
  rows: number;
}

/**
 * A motion field: returns a value roughly in [-1, 1] for a cell.
 * `dx`/`dy` are offsets from the grid centre, with dx already scaled by the
 * character aspect ratio (0.875 in the old HeroAscii code), `dist` = hypot(dx, dy).
 *
 * Fields are created through factories because some keep per-frame state
 * (e.g. "cells" precomputes ripple centres in `prepare`), and two instances of
 * the same field may be live at once while blending.
 */
export interface Field {
  name: string;
  prepare?(ctx: FieldCtx): void;
  sample(
    x: number,
    y: number,
    dist: number,
    dx: number,
    dy: number,
    ctx: FieldCtx,
  ): number;
}

export type FieldFactory = () => Field;

/**
 * A shape rasterised once into a square normalised buffer of `size × size`.
 * - `tone`: 0..1, how much ink a point should carry (1 = densest glyph).
 * - `sdf` (icons only): signed distance in buffer pixels, negative inside.
 *   When both sides of a blend have an SDF, the engine blends SDFs so icons
 *   melt into each other instead of crossfading.
 */
export interface ShapeBuffer {
  size: number;
  tone: Float32Array;
  sdf?: Float32Array;
  /**
   * Images only: shading inside the silhouette (tone without the matte). With
   * an SDF, blends melt the silhouette via the SDF and crossfade the shading.
   */
  shade?: Float32Array;
}

/**
 * Icon drawer: paint the icon in white on a transparent `size × size` canvas.
 * Bold silhouettes only — fine detail disappears at ASCII resolution.
 * Use fill() for solid areas and thick strokes (≥ size * 0.06) for lines.
 */
export type IconDrawer = (ctx: CanvasRenderingContext2D, size: number) => void;

/** Rectangle in CSS pixels, relative to the viewport. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AsciiState {
  id: string;
  /** Motion field name (see fields.ts). */
  field: string;
  /**
   * Optional playlist: the state cycles through these fields over time,
   * blending each into the next (overrides `field`).
   */
  fields?: string[];
  /** Seconds per field in a playlist (default 7). */
  period?: number;
  /** 0..1 how much of the field's dense peaks are drawn in accent ink (default 0). */
  accent?: number;
  /** Shape key registered with the engine, or null for a free field. */
  shape: string | null;
  /** Where the shape sits on screen. Resolved each frame (may follow a DOM element). */
  frame: () => Rect;
  /** 0..1 overall ink. Lower it behind reading text. */
  intensity: number;
  /** 0..1 strength of the field around the shape, inside the ellipse. */
  ambient: number;
  /** Shape size as a fraction of the frame's short side (default 0.8). */
  shapeScale?: number;
  /**
   * 0..1 how much the field and the pointer lens displace the shape (default 1).
   * Keep 0 on faces: any warp makes them unrecognisable.
   */
  warp?: number;
  /** 0..1 how much the field modulates ink inside the shape (default 1). Low = the image's own shading wins. */
  texture?: number;
}
