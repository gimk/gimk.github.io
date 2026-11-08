/**
 * Shared set-up for pages that run the ASCII stage (everything but the lab,
 * which has its own choreography): theme inks, project images, the usual
 * frames, scroll anchors, the edge blur, and the page lifecycle under Astro's
 * client router.
 */
import { AsciiEngine, type Rgba } from "./engine";
import { ICONS } from "./icons";
import { iconShape, imageSample, imageShape, type ImageSample } from "./shapes";
import type { Rect } from "./types";

// ---------------------------------------------------------------------------
// Lifecycle

/**
 * Run `init` on every page load (first visit and client-side navigations)
 * when `selector` matches, and its cleanup before the page is swapped out.
 */
export function onPage(selector: string, init: () => (() => void) | void) {
  let cleanup: (() => void) | void;
  document.addEventListener("astro:page-load", () => {
    if (!document.querySelector(selector)) return;
    cleanup = init();
  });
  document.addEventListener("astro:before-swap", () => {
    cleanup?.();
    cleanup = undefined;
  });
}

// ---------------------------------------------------------------------------
// One engine for the whole visit
//
// Every page's canvas carries transition:persist, so the router keeps the same
// canvas across navigations, and the engine drawing on it keeps running. A
// page leaving calls `releaseEngine`, which freezes what is on screen; the next
// page gets the same engine from `stageEngine` and sets its own states, which
// the frozen picture blends into.

let live: { engine: AsciiEngine; canvas: HTMLCanvasElement } | null = null;

/** The running engine if it already draws on this canvas, or a new one. */
export function stageEngine(canvas: HTMLCanvasElement): AsciiEngine {
  if (live?.canvas === canvas) return live.engine;
  live?.engine.stop();
  live = { engine: new AsciiEngine({ canvas, fontSize: 10 }), canvas };
  return live.engine;
}
/** The page is leaving: keep the engine drawing what is on screen for the next one. */
export function releaseEngine(engine: AsciiEngine) {
  if (live?.engine === engine) engine.hold();
  else engine.stop();
}
if (typeof document !== "undefined") {
  // The new page has no stage: stop drawing on a canvas that is gone.
  document.addEventListener("astro:after-swap", () => {
    if (live && !live.canvas.isConnected) {
      live.engine.stop();
      live = null;
    }
  });
}

// ---------------------------------------------------------------------------
// Frames

export const wide = () => innerWidth >= 768;
export const rectOf = (el: Element): Rect => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};
/**
 * Phones: one large circle, about 2.3 screen widths across, centred near the
 * top so it runs off both sides and the top, with its soft rim above the text.
 */
const phoneCircle = (): Rect => {
  const d = innerWidth * 2.3;
  return { x: innerWidth / 2 - d / 2, y: innerHeight * 0.1 - d / 2, w: d, h: d };
};
/** Phones: the visible band at the top, where images and the field's centre sit. */
const phoneFocus = (): Rect => ({ x: -innerWidth * 0.15, y: innerHeight * 0.06, w: innerWidth * 1.3, h: innerHeight * 0.44 });
/** Right side: an ellipse overscanning the right half, its rim under the text. */
export const side = (): Rect =>
  wide() ? { x: innerWidth * 0.28, y: -innerHeight * 0.35, w: innerWidth * 1.12, h: innerHeight * 1.7 } : phoneCircle();
/** The visible right half, where images and the field's centre sit. */
export const sideFocus = (): Rect =>
  wide() ? { x: innerWidth * 0.5, y: 0, w: innerWidth * 0.5, h: innerHeight } : phoneFocus();
const mirror = (r: Rect): Rect => ({ ...r, x: innerWidth - (r.x + r.w) });
export const sideLeft = (): Rect => (wide() ? mirror(side()) : side());
export const sideFocusLeft = (): Rect => (wide() ? mirror(sideFocus()) : sideFocus());
/** Centred on the screen. On phones it is wider than the screen and runs off both sides. */
export const centre = (): Rect => {
  if (wide()) return { x: innerWidth * 0.08, y: innerHeight * 0.04, w: innerWidth * 0.84, h: innerHeight * 0.92 };
  const d = Math.min(innerWidth * 1.8, innerHeight);
  return { x: innerWidth / 2 - d / 2, y: innerHeight / 2 - d / 2, w: d, h: d };
};
/** A wide, low ellipse behind an element (e.g. a centred title). */
export const bandAround = (el: Element) => (): Rect => {
  const r = el.getBoundingClientRect();
  const w = Math.max(innerWidth * 1.1, r.width * 1.6);
  const h = Math.max(r.height * 2.2, innerHeight * 0.55);
  return { x: r.left + r.width / 2 - w / 2, y: r.top + r.height / 2 - h / 2, w, h };
};

// ---------------------------------------------------------------------------
// Stage

/** Every animation, in order: intros cycle through it and projects take from it by position. */
export const PLAYLIST = ["wave", "vortex", "interference", "plasma", "tunnel", "rings", "solar", "cells", "grid", "quasicrystal", "moire", "rose", "warp"];
const ICON_BY_PROJECT: Record<string, string> = {
  "comp-studio": "comp",
  "colors-studio": "colors",
  "photo-portfolio": "photo",
  "dither-studio": "dither",
  "bankin-year-2": "bankin",
  "bankin-year-1": "bankin",
  "future-of-coach": "coach",
  "coach-desktop": "coach",
};
/**
 * The animation for the project at `index` in the projects list (newest first,
 * the order shown on /projects): project 0 gets PLAYLIST[0], project 1 gets
 * PLAYLIST[1], and so on, wrapping back to the start when projects outnumber
 * animations. Add or remove animations and projects freely: the list order is
 * the only input, so there is no table to keep in sync.
 */
export function fieldAt(index: number) {
  const n = PLAYLIST.length;
  return PLAYLIST[((index % n) + n) % n];
}

/** The settings a project image gets wherever it is shown. */
export const PROJECT_LOOK = { ambient: 0.75, shapeScale: 0.72, warp: 0.35, texture: 0.5 } as const;

export interface Stage {
  engine: AsciiEngine;
  /** Register a project's thumbnail as shape `key` (icon fallback until it loads). */
  addProjectImage(key: string, src: string, projectId?: string): void;
  destroy(): void;
}

export function createStage(canvas: HTMLCanvasElement): Stage {
  const root = document.documentElement;
  const engine = stageEngine(canvas);
  const images = new Map<string, ImageSample>();

  function applyTheme() {
    const accent = getComputedStyle(root).getPropertyValue("--color-accent").trim().split(/\s+/).map(Number);
    const dark = root.classList.contains("dark");
    const fieldInk: Rgba = dark ? [255, 255, 255, 0.34] : [20, 20, 20, 0.34];
    const shapeInk: Rgba = [accent[0], accent[1], accent[2], dark ? 0.95 : 1];
    engine.setInks(fieldInk, shapeInk);
    images.forEach((img, key) =>
      engine.setShape(key, imageShape(img, { lightInk: dark, contrast: 1.3, floor: 0.35, fadeBottom: 0 })),
    );
  }
  const observer = new MutationObserver(applyTheme);
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  applyTheme();

  return {
    engine,
    addProjectImage(key, src, projectId) {
      const icon = ICONS[ICON_BY_PROJECT[projectId?.toLowerCase() ?? ""] ?? ""] ?? ICONS.blank;
      engine.setShape(key, iconShape(icon));
      const img = new Image();
      const loaded = () => {
        images.set(key, imageSample(img));
        applyTheme();
      };
      img.onload = loaded;
      img.src = src;
      // Already cached (e.g. shown on the previous page): no icon flash.
      if (img.complete && img.naturalWidth) {
        img.onload = null;
        loaded();
      }
    },
    destroy() {
      observer.disconnect();
      releaseEngine(engine);
    },
  };
}

// ---------------------------------------------------------------------------
// Scroll → state progress

export interface Anchor {
  /** scrollY where the state is fully formed. */
  y: number;
  /** Slice of the gap to the next anchor where the morph happens. */
  win: [number, number];
}
export function scrollProgress(anchors: Anchor[], y = scrollY): number {
  if (!anchors.length || y <= anchors[0].y) return 0;
  for (let j = 0; j < anchors.length - 1; j++) {
    const a = anchors[j];
    const b = anchors[j + 1];
    if (y < b.y) {
      const f = (y - a.y) / Math.max(1, b.y - a.y);
      const [w0, w1] = a.win;
      return j + Math.min(1, Math.max(0, (f - w0) / (w1 - w0)));
    }
  }
  return anchors.length - 1;
}
export const docTop = (el: Element) => el.getBoundingClientRect().top + scrollY;

// ---------------------------------------------------------------------------
// Edge blur: text blurs and fades as it slides under the header or towards
// the bottom of the screen, like the hero text arriving on the boot.

export function edgeBlur(els: HTMLElement[], reduced: boolean, opts: { bottom?: boolean } = {}) {
  const bottom = opts.bottom ?? true;
  const state = new Map<HTMLElement, number>();
  const header = document.querySelector("header");
  return function update() {
    const vh = innerHeight;
    const top = header ? header.offsetHeight : 80;
    const topZone = 110;
    const bottomZone = vh * 0.16;
    const values = els.map((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return 1;
      const c = r.top + Math.min(r.height, 120) / 2;
      const fromTop = (top + topZone - c) / topZone;
      const fromBottom = bottom ? (c - (vh - bottomZone)) / bottomZone : 0;
      const e = Math.max(0, Math.min(1, Math.max(fromTop, fromBottom)));
      return e * e * (3 - 2 * e);
    });
    els.forEach((el, i) => {
      const e = Math.round(values[i] * 100) / 100;
      if (state.get(el) === e) return;
      state.set(el, e);
      el.style.filter =
        e <= 0
          ? ""
          : reduced
            ? `opacity(${(1 - e * 0.9).toFixed(2)})`
            : `blur(${(e * 6).toFixed(2)}px) opacity(${(1 - e * 0.9).toFixed(2)})`;
    });
  };
}
