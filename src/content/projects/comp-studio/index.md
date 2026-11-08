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

<a href="https://www.compstud.io" target="_blank" rel="noopener noreferrer">**Comp**</a> is a node-based image and video editor that runs in the browser. You drop in a photo or video (or generate one from scratch), wire it through effects, animate sliders with modulators, and see everything update in real time before exporting your file.

I started building it right after <a href="/projects/dither-studio">Dither Studio</a>. Working on Dither Studio made me realize that a single fixed pipeline with forty controls crammed into a sidebar only gets you so far. With Comp, I ditched the sidebar and put every step on an open canvas, so you can see the whole chain, reorder effects whenever you want, and branch things off.

Everything runs locally in your browser, with no account needed. Your projects and files stay on your machine, except if you choose to use the AI Image node with your own API key.

---

## Onboarding

I spent a lot of time working on the first few minutes of the experience. Most people don't know what "node-based compositing" means, and landing on a blank canvas full of boxes and wires is pretty intimidating. Instead of dropping you straight into an empty editor, Comp shows you how it works first.

### An interactive intro

The landing page features a small working graph with an input photo, an effect node, and an output. An animated cursor wires them together right in front of you:

<video src="/projectfiles/comp-studio/comp-hero.webm" autoplay loop muted playsinline aria-label="Comp's opening screen: a cursor wires a photo of a red house into a module titled comp, drags an Output card in from the edge and connects it, and the transformed house appears in it"></video>

You see a picture go in on the left and come out transformed on the right, so you get the core concept in a few seconds before even clicking "Get started".

### Quick tour

First-time visitors also get a short four-step walkthrough using quick clips recorded straight from the app.

![Comp's welcome tour on a first visit: a clip of a photo wired through Halftone and Chromatic Aberration into a viewer, next to the "Welcome to Comp" introduction](/projectfiles/comp-studio/comp-welcome.webp)

#### 1. Everything is a module

You start with a picture, run it through a couple of effects, and see the result live as wires connect each step from left to right.

<video src="/projectfiles/comp-studio/comp-step-1.mp4" autoplay loop muted playsinline aria-label="A small graph: an image wired through two effects into a viewer"></video>

#### 2. Bring in an image

You can drag and drop an image or video onto the canvas, paste straight from your clipboard, or pick an input from the menu.

<video src="/projectfiles/comp-studio/comp-step-2.mp4" autoplay loop muted playsinline aria-label="An image node on the canvas showing a photo"></video>

#### 3. Connect your modules

Add an effect from the menu (or press `Shift+A` anywhere on the canvas), then drag a wire from your image to the effect and into a Viewer.

<video src="/projectfiles/comp-studio/comp-step-3.mp4" autoplay loop muted playsinline aria-label="An image wired into an effect, then into a viewer showing the result"></video>

#### 4. Export

When you're happy with the result, connect your chain to a Render module, pick a format (PNG, JPG, GIF, MP4, or WebM), and hit Render.

<video src="/projectfiles/comp-studio/comp-step-4.mp4" autoplay loop muted playsinline aria-label="A Renderer with a finished file ready to download"></video>

### Starter templates

Even after the quick tour, I didn't want to just drop people onto an empty canvas. Before you start, a project picker lets you choose from a list of hand-made templates ranging from beginner to advanced. Each one is built to highlight specific modules and workflows, so you can see what the tool is capable of, poke around to see how the nodes are wired together, and easily swap in your own pictures.

![Comp's project welcome screen showing a list of beginner, medium, and advanced templates on the left, with the "Soap dreams" Depth AI template selected on the right](/projectfiles/comp-studio/comp-templates.jpg)

---

## How It Works

Everything on the canvas is a module, and wires flow from left to right:

- **Inputs**: images, photo batches, video, audio, text, 3D models, or procedural generators like Noise, Plasma, and Gradients.
- **Effects**: around 120 of them across ten categories, going from basic photo adjustments (Exposure, Curves, Bokeh) to heavier stylization (Halftone, Risograph, CRT scanlines, Datamosh, or fluid simulation).
- **Modulators**: LFOs, envelopes, audio reactivity, step sequencers, and point trackers. You can plug one into any slider to animate it automatically, like pulsing an effect to the beat of a song.
- **AI & Code**: local AI models for masking, depth maps, or background removal, plus a custom shader node if you want to write your own GLSL.
- **Outputs**: a standard Viewer, a fullscreen canvas preview, a second-screen Projector, video scopes, or a Render node to export files.

Wires are color-coded so you can read a graph even when zoomed out: blue for images, amber for modulation signals, and purple for rendered outputs.

---

## Design Decisions

The main rule I stuck to was keeping modules small and focused. For example, a CRT look isn't one giant node with forty sliders. Instead, it's a Scanlines node plugged into a Shadow Mask node, plugged into Lens Distortion. That way you can swap their order anytime to see how the image reacts. It makes the menu longer, but each node stays compact and easy to read.

I also spent a lot of time making the canvas feel good in the hand. Nodes snap into alignment, deleting a node automatically heals the wire it was on, and dropping a new node onto an existing wire inserts it straight into the chain. If you press `Shift+A` while dragging a wire in empty space, the search menu pops up and auto-connects whatever module you pick. I also gave the thin sliders wider invisible hitboxes so you don't accidentally drag the whole card when trying to tweak a value.

---

## Images as Parameters

This is probably my favorite feature, borrowed straight from Blender's shader editor.

Any slider with a diamond-shaped port can take an image as an input instead of a single number, giving the slider a different value for every pixel. For instance, if you plug a radial gradient into a Blur node's radius, the center of your photo stays sharp while the edges blur out, without needing a separate mask node.

It also works the other way around: an Image Statistic node can read the average brightness of a video and turn it into a number signal to drive other sliders.

---

## Groups & Presets

Once you build a chain of nodes you like, you can collapse it into a single Group node, choose which sliders stay visible on the front, and save it as a reusable preset. Comp comes with a dozen built-in presets (like **Toon** shading or **Slit-Scan** time displacement) that you can drop into any project as a single node.

If you need to apply the same look to a bunch of files at once, the Image Set node can run your entire graph across a batch of photos automatically.

---

## Local AI

I wanted useful AI tools in Comp without having to charge subscriptions or pay for servers, so almost all of them run locally in your browser using small models from Hugging Face:

- **Depth** estimates a depth map so you can relight a flat photo in 3D.
- **Cut Out**, **Magic Mask**, and **Text Mask** remove backgrounds or isolate objects from a click or a short text prompt.
- **Describe** generates captions from an image, and **Fill** erases marked areas.

Each model downloads once and stays cached in your browser. Since a model's output is just a regular image (like a black-and-white mask or a depth map), you can plug it into any effect or slider just like everything else.

The only exception is the **AI Image** generator, which calls OpenRouter or Google AI Studio using your own API key. Comp also exposes a read-only MCP server (`compstud.io/mcp`) and an agent skill so AI coding tools can generate valid `.comp` project files from a prompt.

---

## Under the Hood

Comp is built with React, TypeScript, and React Flow for the node canvas. Every effect runs on the GPU as a WebGL2 fragment shader, so changes happen in real time at full resolution, and inactive branches aren't calculated until they are connected to an output.

Like my other recent projects, I built this with the help of coding agents over about six weeks. They handled the shader math and plumbing, while I focused on the product design, the canvas interactions, and tuning the effects.
