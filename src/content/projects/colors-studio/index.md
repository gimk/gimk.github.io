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

![Colors review board showing six named palettes side by side, each swatch labelled with its step, hex value, and contrast ratios](/projectfiles/colors-studio/colors-cover.png)

<a href="https://colors.pantoine.com" target="_blank" rel="noopener noreferrer">**Colors**</a> is a palette builder that uses curves instead of fixed steps. You pick a base color, and then shape the rest of the ramp using three Bézier curves for lightness, chroma, and hue. Everything is saved directly in the URL, so if you want to share a palette, you just copy the link.

I built this because I kept running into the same frustration when working on design systems and rebrands. Most palette generators just lighten or darken a base color in fixed increments. You can't easily boost saturation in the midtones, or shift the hue slightly warmer in the highlights and cooler in the shadows. The results usually feel flat, and the darker shades quickly turn muddy.

Using curves in the OKLCH color space fixes that, because you can treat a color ramp as a continuous shape rather than a list of numbers. Still, raw curves can be annoying to set up from scratch, so I spent a lot of time making sure the tool gives you a good starting point right away:

- When you pick a color, the chroma curve automatically follows the natural ceiling of that hue (yellows stay saturated in the light steps, blues stay saturated in the darks), so you only use the handles to tweak the result.
- Your base color stays locked in place. A lot of generators quietly shift your input color to make the math easier, whereas here the curve bends around your exact hex value so your brand color never drifts.
- If you work in wider color spaces like Display P3, each swatch shows a small indicator whenever a shade clips outside the target gamut.

The basic generator was up and running in a single evening with the help of coding agents, which left me free to obsess over the tricky math and interaction details. For example, standard CSS gamut mapping often lets hues drift by up to 9 degrees just to keep a tiny bit of extra saturation. Since the whole point of this tool is deliberate hue control, I tightened that search so the hue stays within 0.5 degrees. Same thing for locking the base color without warping the neighboring steps on the curve.

It's built with React, TypeScript, and <a href="https://culorijs.org" target="_blank" rel="noopener noreferrer">`culori`</a> for the color math, plus <a href="https://github.com/meodai/color-names" target="_blank" rel="noopener noreferrer">`color-name-list`</a> to automatically name every palette. Once you're happy with your ramps, you can export them to Hex, OKLCH, CSS variables, Tailwind, JSON, or SVG to drop straight into Figma.
