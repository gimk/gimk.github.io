---
title: "Vibe Coding projects"
description: "Some small websites I built recently"
date: "March 2026"
thumbnail: "/projectfiles/thumbnails/camera-thumbnail.png"
---

Over the past few weeks, I built three personal websites using what I now think of as a new way of working: **Vibe Coding**. Each project started as a clear idea, and was brought to life in a few evenings using **Antigravity** and the **Gemini CLI** as accelerators. Here's a look at all three.

---

## The Projects

### 📷 Photos Gallery — [photos.pantoine.com](https://photos.pantoine.com)

![Preview of photos.pantoine.com — a minimalist digital exhibition with a disclaimer screen and subtle blue-tinted background](/projectfiles/vibe-coding-trilogy/photos-cover.png)

A personal photography gallery built as a **digital exhibition** — designed for the patient observer. The interface is deliberately sparse: a centered disclaimer greets you first, asking you to slow down. Navigation is scroll or keyboard-based, and each photograph fills the screen.

---

### 🍽️ Antoine's Kitchen — [recipes.pantoine.com](https://recipes.pantoine.com)

![Preview of Antoine's Kitchen — a structured recipe grid with monospaced typography, category filters, and monochrome food photography](/projectfiles/vibe-coding-trilogy/recipes-cover.png)

A personal recipe website born from my background as a home cook with a cooking license. The recipes here are refined through repeated sessions and carry the kind of personal notes that never make it into a cookbook. Clean, structured, and grid-based — it's the technical side of cooking made visible.

---

### 🎞️ Simulation Recipes — [fujisims.pantoine.com](https://fujisims.pantoine.com)

![Preview of fujisims.pantoine.com — a dark, cinematic film protocol archive with serif typography and film simulation recipe cards](/projectfiles/vibe-coding-trilogy/fujisims-cover.png)

A Fujifilm X-System film simulation archive. Each entry is a custom recipe with specific in-camera settings that define a photographic look — from something close to classic Kodak tones to more modern, desaturated chrome aesthetics. The site presents them as a serious archive, with a clinical, film-protocol aesthetic.

---

## The Technical Side

Each project was built with **[Astro](https://astro.build)** and deployed on **[GitHub Pages](https://pages.github.com)** with a custom domain — a stack I've now become very comfortable with.

### photos.pantoine.com

The most technically interesting feature is the **dynamic background color system**. During the Astro build, the site fetches a small version of each image (400px) and runs it through **node-vibrant** to extract a primary "impactful" color. The logic prioritizes the `Vibrant` swatch, falling back to `DarkVibrant`, `Muted`, or `LightVibrant`. This pre-computed color is then used to set a subtle, perfectly complementary background for each photograph, without any runtime processing. The transition between images is seamless.

### recipes.pantoine.com

The site uses **Astro Content Collections** with typed MDX frontmatter to structure every recipe. An embedded **React Island** handles interactive cooking timers. Styling uses **Tailwind CSS** with a custom dark, warm design system. AI was used heavily for schema wiring, component boilerplate, image generation, and CSS refactoring — the tedious scaffolding that would normally eat hours.

### fujisims.pantoine.com

Built around an Astro content collection for recipes, with a **dark, cinematic design system** built in vanilla CSS. Each recipe card is dynamically generated from a typed Markdown file defining the film base, in-camera adjustments, and a set of sample photographs. EXIF data is extracted at build time using **exifr** and displayed on each photo card within the recipe detail page.

The most recent addition is a **full community submission system** — a technically interesting challenge given the site is hosted on GitHub Pages (a purely static host with no server or database). The solution:

1. **Public `/submit` page** — an anonymous form covering all recipe parameters: film simulation, grain, color chrome, white balance, dynamic range, tone adjustments, and up to 6 example photos. No account required.

2. **Client-side image compression** — camera JPEGs can be 20–30 MB. Before anything leaves the browser, each image is drawn onto an HTML5 `<canvas>`, resized to a maximum of 2048px on the longest side, and re-encoded as JPEG at 85% quality. A typical 25 MB file becomes 1–3 MB. This happens entirely in-browser using the native Canvas API — no external library.

3. **Cloudflare Worker** — the form POSTs a JSON payload (recipe settings + base64 images) to a small Cloudflare Worker (~150 lines). The Worker verifies a **Cloudflare Turnstile** CAPTCHA token, then uses the GitHub Contents API to create a new branch, commit the images and a generated `.md` file, and open a **Pull Request** against the main branch.

4. **GitHub PR as the admin panel** — there is no custom admin interface. The PR is the review mechanism: I receive a GitHub notification, inspect the diff and images directly on github.com, and either merge (recipe goes live after the CI rebuild, ~2 minutes) or close (submission discarded). The entire approval history is Git history.

The result is a zero-cost, zero-infrastructure CMS with full audit trail, spam protection, and a review workflow that required no new tooling to learn.

---

## What's Next

### photos.pantoine.com

- A **collection system** is in the works, to group photographs by theme, trip, or mood.
- A **new navigation pattern** to move between photographs in a more expressive way.

### recipes.pantoine.com

- The collection is small but growing. Many more recipes to document and share — this is just the foundation.
- Thinking about adding a **lexicon page** for culinary techniques.

### fujisims.pantoine.com

- The community submission system is now live — anyone can submit a recipe without an account. The backlog of unsubmitted personal profiles will go through this flow too.
- Considering adding a **comparison mode** to show the same scene with different simulations side by side.

---

## A Note on Vibe Coding

All three projects were built in heavily AI-assisted sessions, using **Antigravity** (this tool) and the **Gemini CLI**. The AI handled the scaffolding, the boilerplate, and the tedious back-and-forth with config and types. I handled the design decisions, the content, and the ideas.

What surprised me is how much this method _accelerates intentionality_ — when the tedious parts are handled automatically, you spend more time deciding what things should feel like, not how to wire them together. Each of these three sites came together in a few evenings of focused work. That wouldn't have been possible a year ago.
