---
title: "Colors"
description: "A tint and shade palette builder driven by curves in OKLCH."
date: "September 3, 2026"
thumbnail: "/projectfiles/thumbnails/colors-thumbnail.png"
demoURL: "https://colors.pantoine.com"
demoLabel: "visit site"
repoURL: "https://github.com/gimk/colors.pantoine.com"
repoLabel: "view on GitHub"
---

![Colors review board — six named palettes (Dark, Brand, Success, Progress, Caution, Error) side by side, each swatch labelled with its step, hex value and contrast ratios against white and black](/projectfiles/colors-studio/colors-cover.png)

**Colors** is a tint and shade palette builder that runs on curves instead of fixed steps. You give it a base colour, and you shape the ramp by dragging three cubic Bézier curves — one for lightness, one for chroma, one for hue.

No accounts, no backend. The whole document lives in the URL hash, so a link *is* the palette: <a href="https://colors.pantoine.com" target="_blank" rel="noopener noreferrer">**colors.pantoine.com**</a>.

---

## Why I Built It

Every tint and shade tool I found online runs the same formula: take the colour, lighten it by a fixed step, darken it by a fixed step, done. None of them let me correct saturation along the ramp, or shift the hue a little as it goes light and dark. So the palettes all come out flat, and the dark end goes to mud.

I kept hitting this on rebranding work, where a design system needs a full ramp per colour and every ramp needs to look deliberate. So I built my own, on OKLCH colour science instead of HSL — better, more colourful, more subtle palettes. I hope it helps other designers on their next rebranding.

---

## Design Decisions

**Curves, not sliders.** The whole premise of the tool is that a ramp is a shape, not a series of increments, so the primary control had to *be* that shape. Three graphs, two anchors and two free handles each. The handles are deliberately unconstrained: that's what lets a single segment produce a hump — chroma peaking mid-ramp, hue arcing away from the base and back — which a well-behaved monotonic easing curve simply cannot do.

**Sensible defaults over a blank canvas.** Curves are powerful and intimidating, so nothing starts flat. Chroma defaults to the gamut ceiling for the hue you typed: yellow holds chroma only while it's light, blue only while it's dark, and the default curve follows that per hue instead of sending both ends into mud. You get a usable ramp before touching anything, and the curves become a refinement tool rather than a prerequisite.

**The colour you typed is in the ramp.** This sounds obvious and almost no tool does it. Lock the base and the curves hold that exact value while you edit around it — it's solved as a constraint inside the fit, not by bending the finished curve through the point. Nothing is more disorienting than a generator that quietly drifts your brand colour.

**A docked toolbox, not a sidebar.** The layout went through several rewrites. Palettes are wide and you stack many of them, so the editing surface had to be resizable and dockable rather than a fixed column stealing horizontal space. There's also a review board mode that drops all the controls and shows the whole document at once — because judging a palette and editing a palette are two different activities that want two different screens.

**Honesty about what you can't see.** Wide gamut support (sRGB, Display P3, Adobe RGB, Rec. 2020, OKLab) is only useful if the tool admits when a colour is out of range, so swatches carry a clipping indicator whose contrast adapts to the swatch underneath it.

---

## Where the Time Actually Went

The generator worked on the first evening. Almost all the remaining effort went into two invisible details.

The first was gamut mapping. The CSS Color 4 default accepts a roughly-in-gamut candidate and lets the 8-bit clip finish the job, which cost up to 9° of hue drift to save about 0.001 of chroma. In a tool whose entire selling point is steering hue, that's the wrong trade, so the search runs strict and holds hue within half a degree.

The second was how the base colour is honoured. Bending the finished curve through the locked point inflated a yellow ramp's middle by a third and cost 0.07 of chroma to gamut mapping. Moving it into the least-squares fit as a Lagrange multiplier fixed it properly.

Neither is a feature anyone will ever notice. Both are the difference between palettes that look designed and palettes that look computed — and that gap is the reason the tool exists at all.

---

## Under the Hood

React 19, TypeScript, Vite, tested with Vitest. Two runtime dependencies: <a href="https://culorijs.org" target="_blank" rel="noopener noreferrer">`culori`</a> for colour conversion, gamut mapping and contrast, and <a href="https://github.com/meodai/color-names" target="_blank" rel="noopener noreferrer">`color-name-list`</a> to name palettes from 30k curated colour names.

Export goes out as hex, OKLCH, CSS variables, Tailwind, SCSS, JSON, PNG or SVG. Palettes run 5 to 21 steps, locked across the document or set per palette.

As with my <a href="/projects/vibe-coding-trilogy">other recent projects</a>, AI agents handled the scaffolding and the maths implementations, which left me free to spend the time where it mattered: the interaction model and the colour behaviour.
