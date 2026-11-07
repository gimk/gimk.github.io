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
// Frames

export const wide = () => innerWidth >= 768;
export const rectOf = (el: Element): Rect => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};
/** Right side: an ellipse overscanning the right half, its rim under the text. */
export const side = (): Rect =>
  wide()
    ? { x: innerWidth * 0.28, y: -innerHeight * 0.35, w: innerWidth * 1.12, h: innerHeight * 1.7 }
    : { x: -innerWidth * 0.1, y: innerHeight * 0.02, w: innerWidth * 1.2, h: innerHeight * 0.42 };
/** The visible right half, where images and the field's centre sit. */
export const sideFocus = (): Rect =>
  wide() ? { x: innerWidth * 0.5, y: 0, w: innerWidth * 0.5, h: innerHeight } : side();
const mirror = (r: Rect): Rect => ({ ...r, x: innerWidth - (r.x + r.w) });
export const sideLeft = (): Rect => (wide() ? mirror(side()) : side());
export const sideFocusLeft = (): Rect => (wide() ? mirror(sideFocus()) : side());
export const centre = (): Rect => ({
  x: innerWidth * 0.08,
  y: innerHeight * 0.04,
  w: innerWidth * 0.84,
  h: innerHeight * 0.92,
});
/** A wide, low ellipse behind an element (e.g. a centred title). */
export const bandAround = (el: Element) => (): Rect => {
  const r = el.getBoundingClientRect();
  const w = Math.max(innerWidth * 1.1, r.width * 1.6);
  const h = Math.max(r.height * 2.2, innerHeight * 0.55);
  return { x: r.left + r.width / 2 - w / 2, y: r.top + r.height / 2 - h / 2, w, h };
};

// ---------------------------------------------------------------------------
// Stage

/** The original animations, for intros that cycle. */
export const PLAYLIST = ["wave", "vortex", "interference", "plasma", "tunnel", "rings", "solar", "cells", "grid"];
/** Motion field per project, so a project looks the same everywhere on the site. */
const FIELD_BY_PROJECT: Record<string, string> = {
  "comp-studio": "interference",
  "colors-studio": "plasma",
  "vibe-coding-trilogy": "vortex",
  "dither-studio": "grid",
  "bankin-year-2": "rings",
  "future-of-coach": "cells",
};
const ICON_BY_PROJECT: Record<string, string> = {
  "comp-studio": "comp",
  "colors-studio": "colors",
  "vibe-coding-trilogy": "photo",
  "dither-studio": "dither",
  "bankin-year-2": "bankin",
  "bankin-year-1": "bankin",
  "future-of-coach": "coach",
  "coach-desktop": "coach",
};
export function fieldFor(projectId: string) {
  const id = projectId.toLowerCase();
  if (FIELD_BY_PROJECT[id]) return FIELD_BY_PROJECT[id];
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PLAYLIST[h % PLAYLIST.length];
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
  const engine = new AsciiEngine({ canvas, fontSize: 10 });
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
      img.onload = () => {
        images.set(key, imageSample(img));
        applyTheme();
      };
      img.src = src;
    },
    destroy() {
      observer.disconnect();
      engine.stop();
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
