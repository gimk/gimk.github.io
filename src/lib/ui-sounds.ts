import { playSound } from "@lib/audio-manager";
import { SOUND_PRESETS, type SoundPreset } from "@lib/sounds";

// Delegated interaction sounds for the new design's links and buttons.
// Mirrors InteractionSound.astro (cursor-in / cursor-out / click / focus) using
// the same preset data. Mute is handled inside playSound.

const MAP: Array<[selector: string, preset: SoundPreset]> = [
  [".cta-pill, .link-row", "button"],
  [".pi-item, .sp-link, #closing a, footer a", "link"],
];

type Slot = {
  click?: string;
  clickVolume?: number;
  cursorIn?: string;
  cursorInVolume?: number;
  cursorOut?: string;
  cursorOutVolume?: number;
  focus?: string;
  focusVolume?: number;
};

function match(target: EventTarget | null): { el: HTMLElement; p: Slot } | null {
  if (!(target instanceof Element)) return null;
  for (const [selector, preset] of MAP) {
    const el = target.closest<HTMLElement>(selector);
    if (el && !el.closest(".interaction-sound-wrapper")) {
      return { el, p: SOUND_PRESETS[preset] as Slot };
    }
  }
  return null;
}

function play(name: string | undefined, volume: number | undefined) {
  if (name) playSound(name, volume ?? 1.0);
}

declare global {
  interface Window {
    __uiSoundsInstalled?: boolean;
  }
}

export function installUiSounds() {
  if (typeof document === "undefined" || window.__uiSoundsInstalled) return;
  window.__uiSoundsInstalled = true;

  document.addEventListener("pointerover", (e) => {
    if (e.pointerType === "touch") return;
    const m = match(e.target);
    if (!m || (e.relatedTarget instanceof Node && m.el.contains(e.relatedTarget))) return;
    play(m.p.cursorIn, m.p.cursorInVolume);
  });

  document.addEventListener("pointerout", (e) => {
    if (e.pointerType === "touch") return;
    const m = match(e.target);
    if (!m || (e.relatedTarget instanceof Node && m.el.contains(e.relatedTarget))) return;
    play(m.p.cursorOut, m.p.cursorOutVolume);
  });

  document.addEventListener(
    "click",
    (e) => {
      const m = match(e.target);
      if (m) play(m.p.click, m.p.clickVolume);
    },
    { capture: true }
  );

  document.addEventListener("focusin", (e) => {
    const m = match(e.target);
    if (m) play(m.p.focus, m.p.focusVolume);
  });
}

installUiSounds();
