---
title: "Vibe Coding projects"
description: "Some small websites I built recently"
date: "March 2026"
thumbnail: "/projectfiles/thumbnails/camera-thumbnail.png"
---

Over the past few weeks, I built four personal websites using what I now think of as a new way of working: **Vibe Coding**. Each project started as a clear idea, and was brought to life in a few evenings using **Antigravity** and the **Gemini CLI** as accelerators. Here's a look at all four.

---

## The Projects

### 👾 ASCII Animation Builder — <a href="https://ascii.pantoine.com" target="_blank" rel="noopener noreferrer">ascii.pantoine.com</a>

![Preview of ascii.pantoine.com — an interactive ASCII animation builder with real-time green terminal canvas, presets, and code export tools](/projectfiles/vibe-coding-trilogy/ascii-cover.png)

An interactive visual generator and synthesizer for real-time ASCII canvas animations. It lets you tweak wave harmonics, particle systems, noise flows, and character density presets in a retro-terminal interface, then directly export self-contained ready-to-use Astro and React components or canvas code.

---

### 📷 Photos Gallery — <a href="https://photos.pantoine.com" target="_blank" rel="noopener noreferrer">photos.pantoine.com</a>

![Preview of photos.pantoine.com — a minimalist digital exhibition with a disclaimer screen and subtle blue-tinted background](/projectfiles/vibe-coding-trilogy/photos-cover.png)

A personal photography gallery built as a digital exhibition for a slower viewing experience. The interface is minimal: a centered disclaimer appears first, suggesting a slower pace. Navigation is scroll or keyboard-based, and each photograph fills the screen.

---

<div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
<div>

### 🍽️ Antoine's Kitchen — <a href="https://recipes.pantoine.com" target="_blank" rel="noopener noreferrer">recipes.pantoine.com</a>

![Preview of Antoine's Kitchen — a structured recipe grid with monospaced typography, category filters, and monochrome food photography](/projectfiles/vibe-coding-trilogy/recipes-cover.png)

A personal recipe website born from my background as a home cook with a cooking license. The recipes here are refined through repeated sessions and carry the kind of personal notes that never make it into a cookbook. Clean, structured, and grid-based — it's the technical side of cooking made visible.

</div>
<div>

### 🎞️ Simulation Recipes — <a href="https://fujisims.pantoine.com" target="_blank" rel="noopener noreferrer">fujisims.pantoine.com</a>

![Preview of fujisims.pantoine.com — a dark, cinematic film protocol archive with serif typography and film simulation recipe cards](/projectfiles/vibe-coding-trilogy/fujisims-cover.png)

A Fujifilm X-System film simulation archive. Each entry is a custom recipe with specific in-camera settings that define a photographic look — from something close to classic Kodak tones to more modern, desaturated chrome aesthetics. The site presents them as a clean archive with a dark, film-protocol aesthetic.

</div>
</div>

---

## The Technical Side

Each project was built with <a href="https://astro.build" target="_blank" rel="noopener noreferrer">**Astro**</a> and deployed on <a href="https://pages.github.com" target="_blank" rel="noopener noreferrer">**GitHub Pages**</a> with a custom domain — a stack I've now become very comfortable with.

### ascii.pantoine.com

Built as a lightweight, client-side visual synthesizer. It renders procedural math, trigonometric wave interference, and particle flows directly onto an HTML `<pre>` character grid at 60 FPS. A built-in code generator converts live parameter configurations into optimized, drop-in Astro and React components with zero external runtime dependencies.

### photos.pantoine.com

The main technical feature is the **dynamic background color system**. During the Astro build, the site fetches a small version of each image (400px) and runs it through **node-vibrant** to extract a primary color. The logic prioritizes the `Vibrant` swatch, falling back to `DarkVibrant`, `Muted`, or `LightVibrant`. This pre-computed color sets a subtle background for each photograph without runtime processing.

### recipes.pantoine.com

The site uses **Astro Content Collections** with typed MDX frontmatter to structure every recipe. An embedded **React Island** handles interactive cooking timers. Styling uses **Tailwind CSS** with a custom light blue, CRT-style design system. AI handled schema wiring, component boilerplate, image generation, and CSS refactoring — the repetitive setup work that usually takes hours.

### fujisims.pantoine.com

Built around an Astro content collection for recipes, with a **dark, cinematic design system** built in vanilla CSS. Each recipe card is dynamically generated from a typed Markdown file defining the film base, in-camera adjustments, and a set of sample photographs. EXIF data is extracted at build time using **exifr** and displayed on each photo card within the recipe detail page.

The most recent addition is a **full community submission system** built directly on GitHub Pages without a dedicated backend:

1. **Public `/submit` page** — an anonymous form covering all recipe parameters: film simulation, grain, color chrome, white balance, dynamic range, tone adjustments, and up to 6 example photos. No account required.

2. **Client-side image compression** — camera JPEGs can be 20–30 MB. Before anything leaves the browser, each image is drawn onto an HTML5 `<canvas>`, resized to a maximum of 2048px on the longest side, and re-encoded as JPEG at 85% quality. A typical 25 MB file becomes 1–3 MB using the native Canvas API.

3. **Cloudflare Worker** — the form POSTs a JSON payload (recipe settings + base64 images) to a small Cloudflare Worker (~150 lines). The Worker verifies a **Cloudflare Turnstile** CAPTCHA token, then uses the GitHub Contents API to create a new branch, commit the images and a generated `.md` file, and open a **Pull Request** against the main branch.

4. **GitHub PR as the admin panel** — there is no custom admin interface. The PR is the review mechanism: I receive a GitHub notification, inspect the diff and images directly on github.com, and either merge (recipe goes live after the CI rebuild, ~2 minutes) or close.

It gives me a free, serverless CMS setup with spam protection and git history for reviews, without adding any complex infrastructure to maintain.

---

## What's Next

### ascii.pantoine.com

- Adding **image/video to ASCII conversion** with animated temporal dithering.
- Introducing a **timeline/keyframes editor** for multi-stage animations.
- Expanding export options to include standalone SVG animations and canvas shaders.

### photos.pantoine.com

- A **collection system** is in the works, to group photographs by theme, trip, or mood.
- A **new navigation pattern** to move between photographs in a more expressive way.

### recipes.pantoine.com

- The collection is small but growing. Many more recipes to document and share — this is just the foundation.
- Thinking about adding a **lexicon page** for culinary techniques.
- I would like to redo the design system from the ground up, to something more rounded, fancy, and warm. More in line with cooking actually.

### fujisims.pantoine.com

- The community submission system is now live — anyone can submit a recipe without an account. The backlog of unsubmitted personal profiles will go through this flow too.
- Considering adding a **comparison mode** to show the same scene with different simulations side by side.

---

## A Note on Vibe Coding

All four projects were built in heavily AI-assisted sessions, using **Antigravity** and the **Gemini CLI**. The AI handled the scaffolding, the boilerplate, and the tedious back-and-forth with config and types. I handled the design decisions, the content, and the ideas.

What surprised me is how much more time I spent refining the feel and design of the sites rather than wrestling with wiring and setup. Each of these four sites came together in a few evenings of focused work. That wouldn't have been possible a year ago.

