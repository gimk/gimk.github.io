// ASCII shimmer: every character of a link's text turns to a glyph at once,
// then the letters settle back from left to right. Runs on hover/focus for
// small text links (not CTAs or cards), and periodically for the header's
// latest-project pill.
const RAMP = "·:+*░";
const HOLD = 60; // ms with every character scrambled
const SPEED = 25; // ms per character to settle, left to right
const MAX_SIZE = 24; // px; links with larger text don't shimmer
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const running = new WeakSet<Text>();

/** Wrap each non-empty text node inside a link in a span (once). */
function textSpans(link: HTMLElement): HTMLElement[] {
  const spans: HTMLElement[] = [];
  const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    if (!node.nodeValue?.trim()) continue;
    const parent = node.parentElement;
    if (parent?.classList.contains("glyph-text")) {
      spans.push(parent);
      continue;
    }
    const span = document.createElement("span");
    span.className = "glyph-text";
    node.replaceWith(span);
    span.appendChild(node);
    spans.push(span);
  }
  return spans;
}

function shimmerSpan(span: HTMLElement) {
  const node = span.firstChild as Text | null;
  if (!node || running.has(node) || document.hidden) return;
  const text = node.nodeValue ?? "";
  running.add(node);

  // Hold the width steady while glyphs swap (single-line text only).
  const pin = span.getClientRects().length === 1;
  if (pin) {
    const w = span.getBoundingClientRect().width;
    span.style.display = "inline-block";
    span.style.width = `${w}px`;
    span.style.whiteSpace = "nowrap";
    span.style.verticalAlign = "bottom";
  }

  const t0 = performance.now();
  const step = (now: number) => {
    const settled = Math.floor((now - t0 - HOLD) / SPEED);
    let out = "";
    for (let i = 0; i < text.length; i++) {
      out += i >= settled && text[i].trim() ? RAMP[Math.floor(Math.random() * RAMP.length)] : text[i];
    }
    node.nodeValue = out;
    const active = settled < text.length;
    span.classList.toggle("is-shimmering", active);
    if (active) requestAnimationFrame(step);
    else {
      node.nodeValue = text;
      span.removeAttribute("style");
      running.delete(node);
    }
  };
  requestAnimationFrame(step);
}

export function shimmerLink(link: HTMLElement) {
  if (reduced()) return;
  // Only plain text links: never CTA pills or cards (project and post rows).
  if (link.matches(".cta-pill, .link-row")) return;
  const spans = textSpans(link);
  // Only small links: any big text in the link means the whole link is skipped.
  if (spans.some((sp) => parseFloat(getComputedStyle(sp).fontSize) >= MAX_SIZE)) return;
  spans.forEach(shimmerSpan);
}

let timer: number | undefined;
let bound = false;

export function initGlyphShimmer() {
  if (!bound) {
    bound = true;
    const onEnter = (e: Event) => {
      const link = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLElement | null;
      if (link) shimmerLink(link);
    };
    document.addEventListener("mouseover", (e) => {
      const link = (e.target as HTMLElement | null)?.closest?.("a[href]");
      // Only when entering the link, not when moving between its children.
      if (link && !link.contains(e.relatedTarget as Node | null)) onEnter(e);
    });
    document.addEventListener("focusin", (e) => {
      if ((e.target as HTMLElement).matches?.(":focus-visible")) onEnter(e);
    });
  }
  // The latest-project pill also shimmers on its own now and then.
  clearInterval(timer);
  const latest = document.querySelector<HTMLElement>(".latest-link");
  if (!latest || reduced()) return;
  setTimeout(() => shimmerLink(latest), 900);
  timer = window.setInterval(() => shimmerLink(latest), 8000);
}
