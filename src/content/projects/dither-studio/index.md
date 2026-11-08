---
title: "Dither Studio"
description: "A brutalist dithering and raster studio in the browser."
date: "August 28, 2026"
thumbnail: "/projectfiles/thumbnails/dither-thumbnail.png"
demoURL: "https://studio.pantoine.com"
demoLabel: "visit site"
repoURL: "https://github.com/gimk/studio.pantoine.com"
repoLabel: "view on GitHub"
---

![Dither Studio showing a dithered blue portrait on a flat red background, with the algorithm, color, levels and compositing panels open on the right](/projectfiles/dither-studio/dither-cover.png)

<a href="https://studio.pantoine.com" target="_blank" rel="noopener noreferrer">**Dither Studio**</a> started as a small weekend experiment. After writing about <a href="/blog/inner-workings-of-ascii">the math behind this site's ASCII wave</a>, I wanted to build a small interactive wave toy to play with those ideas further. I kept adding features after work, and it quickly snowballed into a full dithering and raster tool in the browser.

You can drop in an image, a video, a 3D model, or use a procedural wave, and convert it into ASCII, Braille, halftone dots, classic 1-bit dithering, or CRT scanlines. Everything runs locally in your browser, and you can export clean vector SVGs, PNGs, GIFs, MP4 videos, or color separation plates for print.

If you look at the commit history, the project actually changed names four times in eleven days as I figured out what it was. It started as a basic ASCII wave builder, then I added GIF export, 3D models via Three.js, and webcam input. The turning point was when I started adding classic dithering algorithms like Bayer, Floyd-Steinberg, and Atkinson. I realized that ASCII was really just one specific dithering pattern among dozens, and keeping separate renderers made no sense. So I threw out the old code and rebuilt everything around a single raster engine.

From a design perspective, the main challenge was keeping over 40 controls in a single sidebar without it turning into a mess. A few things helped make it work:

- **Following the pipeline:** The sidebar is ordered top to bottom in the exact sequence the image gets processed (Source, Output Mode, Palette, Levels, and Compositing), so the layout makes intuitive sense.
- **No dumbed-down "simple mode":** I hate when switching from advanced to basic mode in a tool secretly resets your custom tweaks. Here, Basic and Advanced modes share the exact same state, so toggling between them just hides or reveals controls without losing your settings.
- **Smart resolution defaults:** Manual resolution sliders are annoying to dial in on different screen sizes. The app automatically picks a crisp grid resolution based on your screen, aspect ratio, and frame rate, and immediately hands over manual control the moment you touch the input.
- **Matching the aesthetic:** A rounded, bubbly SaaS interface felt wrong for a tool that makes gritty, raw textures. I went with a crisp terminal look instead, using monospace fonts, sharp borders, and direct number inputs rather than finicky sliders.

My favorite feature in the whole app is probably **Beam Mode**. It's inspired by the old Rutt-Etra analog video synthesizer (and the classic Joy Division *Unknown Pleasures* album cover). Instead of a grid of pixels, it draws horizontal scanlines across the canvas and pushes them up or down based on brightness. Because it's pure geometry, when you export to SVG you get continuous vector paths that you can send straight to a pen plotter.

Like my other recent projects, coding agents handled the heavy math, Three.js setup, and `WebCodecs` video encoding, while I spent my evenings focused on the layout, the interactions, and tuning how the effects look. The project is currently on hold though, as I moved on to building <a href="/projects/comp-studio">**Comp**</a>, which takes a lot of these ideas into a much more capable node-based tool.
