---
title: "Comp"
description: "A modular compositing tool for pictures and video, in the browser."
date: "October 3, 2026"
thumbnail: "/projectfiles/thumbnails/comp-thumbnail.png"
demoURL: "https://www.compstud.io"
demoLabel: "visit site"
repoURL: "https://github.com/gimk/compstudio"
repoLabel: "view on GitHub"
---

<video src="/projectfiles/comp-studio/comp-loop.mp4" autoplay loop muted playsinline aria-label="A looping tour of Comp: images, video, noise, text and sound feeding a Layers module; a module palette with over 130 modules; a Depth Relight module running on device; keyframes animating a Halftone on a timeline; and a Renderer exporting to MP4, WebM, GIF, PNG and JPG"></video>

**Comp** is a node-based image and video editor in the browser. You drop in a photo or a video (or generate one), wire it through effects, animate the sliders with modulators, and watch the result update live. When you're happy with it, you export a file.

It comes right after <a href="/projects/dither-studio">Dither Studio</a>. Working on Dither Studio made me realize that a single fixed pipeline with forty controls in a sidebar only gets you so far. Comp ditches the sidebar and puts every step on an open canvas, so you can see the whole chain, reorder effects, and branch them off.

No accounts. Your projects save locally in your browser and your files stay on your machine (except if you use the AI Image node with your own API key): <a href="https://www.compstud.io" target="_blank" rel="noopener noreferrer">**compstud.io**</a>.

---

## Onboarding

I spent a lot of time on the first few minutes. Most people don't know what "compositing" means, and a blank canvas full of boxes and wires looks intimidating. So before dropping you in, Comp shows you how it works.

### An interactive intro

The landing screen is a small working graph: an input photo, an effect node, and an output. An animated cursor wires it together right in front of you:

<video src="/projectfiles/comp-studio/comp-hero.webm" autoplay loop muted playsinline aria-label="Comp's opening screen: a cursor wires a photo of a red house into a module titled comp, drags an Output card in from the edge and connects it, and the transformed house appears in it"></video>

A picture goes in on the left and comes out changed on the right. You get the idea in a few seconds, before even clicking Get started.

### Quick tour

First-time visitors also get a short four-step walkthrough, using short clips recorded straight from the app.

![Comp's welcome tour on a first visit: a clip of a photo wired through Halftone and Chromatic Aberration into a viewer, next to the "Welcome to Comp" introduction](/projectfiles/comp-studio/comp-welcome.webp)

#### 1. Everything is a module

Start with a picture, run it through a couple of effects, and see the result live. Wires connect each step from left to right.

<video src="/projectfiles/comp-studio/comp-step-1.mp4" autoplay loop muted playsinline aria-label="A small graph: an image wired through two effects into a viewer"></video>

#### 2. Bring in an image

Drag and drop an image or video onto the canvas, paste from your clipboard, or pick Image from the Input menu.

<video src="/projectfiles/comp-studio/comp-step-2.mp4" autoplay loop muted playsinline aria-label="An image node on the canvas showing a photo"></video>

#### 3. Connect your modules

Add an effect from the menu (or press `Shift+A` anywhere on the canvas), then drag a wire from your image to the effect, and into a Viewer.

<video src="/projectfiles/comp-studio/comp-step-3.mp4" autoplay loop muted playsinline aria-label="An image wired into an effect, then into a viewer showing the result"></video>

#### 4. Export

Connect your chain to a Render module, pick a format (PNG, JPG, GIF, MP4, or WebM), and hit Render.

<video src="/projectfiles/comp-studio/comp-step-4.mp4" autoplay loop muted playsinline aria-label="A Renderer with a finished file ready to download"></video>

---

## How It Works

Everything on the canvas is a module, and wires flow from left to right:

- **Inputs**: images, image batches, video, audio, text, 3D models, or procedural generators like Noise, Plasma, and Gradients.
- **Effects**: around 120 of them across ten categories — from standard photo adjustments (Exposure, Curves, Bokeh) to heavy stylization (Halftone, Risograph, CRT scanlines, Datamosh, fluid simulation).
- **Modulators**: LFOs, envelopes, audio reactivity, step sequencers, or point trackers. Plug one into any slider and it animates on its own — like pulsing an effect to the beat of a song.
- **AI & Code**: local AI models for masking, depth, or background removal, plus a custom shader node if you want to write your own GLSL.
- **Outputs**: a standard Viewer, a fullscreen canvas background, a second-screen Projector, video scopes, or a Render node to export files.

Wires are color-coded so you can read a graph from zoomed out: blue for images, amber for modulation signals, purple for rendered outputs.

---

## Design Decisions

The main rule I stuck to was **small modules that you chain together**. A CRT look isn't one giant node with forty sliders — it's Scanlines, plugged into Shadow Mask, plugged into Lens Distortion. You can swap their order anytime to see how the image reacts. It makes the menu longer, but each node stays small and readable.

I obsessed over how the canvas feels to use: alignment snapping, undo/redo, deleting a node and having the wire heal itself automatically, or dropping a new node directly onto an existing wire to insert it. If you press `Shift+A` while dragging a wire, the search menu pops up and auto-connects whatever node you pick. Sliders look thin, but have wide invisible hitboxes so you don't accidentally drag the whole card when reaching for a value. At the bottom of the screen, a small hint bar quietly shows shortcuts for whatever you're currently selecting or dragging.

Visually, the UI uses frosted glass panels with Bricolage Grotesque for headers, Instrument Sans for UI labels, and DM Mono for numbers. It supports light and dark mode, while port colors stay fixed so they always mean the same thing.

---

## Images as Parameters

This is my favorite feature, borrowed straight from Blender's shader editor.

Any slider with a diamond-shaped port can take an image as an input instead of a single number. The slider then gets a different value for every pixel. For example, if you plug a radial gradient into a Blur's radius, the center stays sharp while the edges blur out — no mask node needed.

When an image is plugged in, the wire turns dashed and the slider locks. It also works in reverse: an Image Statistic node can read the average brightness of a video and turn it into a number signal to drive other sliders.

---

## Groups & Presets

Once you've built a chain you like, you can collapse it into a single Group node, pick which sliders stay visible on the front, and save it as a reusable preset. Comp ships with a dozen built-in presets (like **Toon** shading or **Slit-Scan** time displacement) as well as full project templates to help you get started.

If you need to process a lot of files at once, the Image Set node runs your entire graph across a batch of photos automatically.

---

## Local AI

I wanted AI tools in Comp without server costs or subscriptions, so almost all of them run locally in your browser.

Small models from Hugging Face handle specific jobs as regular nodes:
- **Depth** estimates a depth map so you can relight a flat photo in 3D.
- **Cut Out**, **Magic Mask**, and **Text Mask** remove backgrounds or isolate objects from clicks or text prompts.
- **Describe** generates captions from an image, and **Fill** erases marked areas.

Each model downloads once and stays cached in your browser. Because a model's output is just an image (like a black-and-white mask or depth map), you can plug it into any effect or slider just like everything else.

The only exception is the **AI Image** generator, which calls OpenRouter or Google AI Studio using your own API key. Comp also exposes a read-only MCP server (`compstud.io/mcp`) and an agent skill, so AI coding tools can generate valid `.comp` project files from a prompt or reference image.

---

## Under the Hood

Comp is built with React, TypeScript, and React Flow for the node canvas. Every effect runs on the GPU as a WebGL2 fragment shader, so changes happen in real time at full resolution, and inactive branches aren't calculated until they're connected to an output.

Like my other recent projects, I built this with the help of AI coding agents over about six weeks. They handled the shader math and plumbing, while I focused on the product design, canvas interactions, and tuning the effects.
