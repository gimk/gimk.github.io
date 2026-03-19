---
title: "Crafting the Pig"
description: "Behind the scenes of the interactive SVG pig."
date: "May 19 2025"
---

If you've spent more than a few seconds on my home page, you probably noticed the little pig in the header. It's not just a static icon—it follows your cursor, blinks occasionally, and gets very excited when your mouse gets too close.

This feature was heavily inspired by [Mark Horn's](https://markhorn.dev/) "Batcat" animation. I loved the personality it brought to a minimalist site, so I decided to build my own version from scratch, specifically tailored for my portfolio's aesthetic.

### The Anatomy of a Pig

The pig is a custom SVG embedded directly in the `Header.astro` component. To make it interactive, I broke it down into several logical groups:

- **Head**: The main circular container.
- **Snout**: A group containing the nose and nostrils.
- **Ears**: Left and right ears as separate paths.
- **Eyes**: Two ellipses that can "blink" by modifying their vertical radius.

By separating these parts, I can manipulate them independently to simulate depth.

### Simulating 3D with "Parallax" Offsets

The core of the "3D illusion" lies in how these parts respond to mouse movement. Instead of moving the entire SVG, I calculate a **normalized offset** based on the mouse position relative to the center of the pig.

```typescript
const normalizedOffsetX = svgRect.width ? deltaX / (svgRect.width / 2) : 0;
const normalizedOffsetY = svgRect.height ? deltaY / (svgRect.height / 2) : 0;
```

Each part has its own `maxOffset` multiplier. Parts that are "closer" to the viewer (like the snout) move more than parts that are "further away" (like the ears or the head itself).

```typescript
const maxSnoutOffset = 1;
const maxHeadOffset = 0.5;
const maxEarOffset = 0.2;
```

When the mouse moves to the right, the snout moves 1 unit, the head moves 0.5 units, and the ears only move 0.2 units. This differential movement creates a convincing sense of depth and rotation without using any actual 3D libraries.

### Independent Tiling

To further reinforce the 3D effect, I added a "tilt" to the ears and eyes. When the pig looks left or right, the ears don't just shift horizontally; they also shift vertically in opposite directions to simulate the head tilting.

```typescript
const ear3dTilt = normalizedOffsetX * 0.2;
const eye3dTilt = normalizedOffsetX * 0.1;

targetLeftEarTy = normalizedOffsetY * maxEarOffset + ear3dTilt;
targetRightEarTy = normalizedOffsetY * maxEarOffset - ear3dTilt;
```

This tiny detail makes the movement feel much more natural and "organic" rather than a flat 2D translation.

### Dancing for Carrots

You might have noticed that when you hover over the pig, your cursor turns into a carrot. This isn't just a visual gag—the pig is programmed to react to its favorite snack.

I implemented a "wiggle" threshold. If the distance between the cursor and the pig's center is less than 60 pixels, the pig enters a "wiggling" state:

```typescript
const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
isWiggling = distance < wiggleThreshold;

// In the animation loop:
let wiggleOffset = 0;
if (isWiggling) {
  wiggleOffset = Math.sin(Date.now() * wiggleFrequency) * wiggleAmplitude;
}
```

This `wiggleOffset` is then added to the translation of every part, making the pig "dance" with excitement as long as the carrot is nearby.

### Smoothing and Polish

To prevent the movement from feeling "jerky," I use a simple linear interpolation (LERP) for smoothing:

```typescript
currentSnoutTx += (targetSnoutTx - currentSnoutTx) * smoothingFactor;
currentHeadTx += (targetHeadTx - currentHeadTx) * smoothingFactor;
```

Combined with a random blinking interval, these small touches of physics and randomness transform a simple SVG icon into a character with its own little personality.
