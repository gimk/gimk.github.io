---
title: "Fun is the hardest system"
description: "Why is making something fun harder than making it usable?"
date: "2026-11-20"
draft: false
---

I find it fascinating how hard game design is. For years now, I've been working in product design, and I've always felt that the answer to most user problems was relatively straightforward. Whether it was adding a button, a feature, or a flow, or improving the UX, it was always a matter of iterating on the same fundamental principles.

When it comes to game design, though, the most important thing is making it fun. And that simple thing is surprisingly hard to get right and fundamentally different to implement. You cannot take the same Cartesian approach, you cannot just pull inspiration from reality, and frankly, you cannot just do what feels logical. In game design, you always have to put fun first, and that's a real challenge.

I was a gamer long before I became a designer or an engineer. Like everyone who uses a product without building it, I thought I knew what made games good. Then I tried to make one, and I saw how deep and subtle it is to get right.

And testing! In games, testing is everything. You have to spend hours just playing to find what works and what doesn't. Arguably, it's the same with all products, but players pay attention in a different way. Immersion breaks the moment you make a mistake. One annoying feature or confusing UI element can ruin it.

I felt that when I started my first game project. At first, it was a traffic simulation, because I like urbanism and optimization. The first commits are satisfying: especially with agentic work now, you go from zero to something "playable" so quickly. But then you test it, and you cannot help but compare it to games you've played before. And the end goal seems so far away.

Here is where each of my three projects is now.

## Transit Flow

<img src="/blogfiles/transit-flow.webp" alt="Transit Flow simulation: top-down view of a Paris crossroads with cars, crossings and a bike lane"/>

Transit Flow is a 2D street-design simulation where you redesign a real intersection in Paris. The buildings and street width are fixed, and the plan is to share that space between cars, cyclists, and pedestrians using lanes, crossings, signals, speed limits, kerbs, planters, and green areas. Once your layout is ready, you run the traffic and get a report on conflicts and comfort: annoyance and injuries cost points, while free space and greenery give a bonus.

It is built in Rust with a Bevy 0.20 game on top of a standalone simulation library, and it is very much a work in progress. Right now, it is only a simulation: there is no UI and no tools yet, so it is not even usable. That's where I ran straight into the problem I mentioned earlier: making the traffic behave realistically is an engineering task, but turning those rules into something that feels rewarding to play is a completely different challenge.

Repo: [github.com/gimk/transit-flow](https://github.com/gimk/transit-flow)

## Clicker Code

<img src="/blogfiles/clicker-code.webp" alt="Clicker Code terminal, with typed code on the left and the shell on the right"/>

Clicker Code is an incremental game set in a CRT-style terminal. You start by typing code yourself, then buy tools, developers, and AI agents to write it for you.

On paper, an incremental game looks like pure product design: clear feedback, steady progression, numbers going up. In practice, keeping it fun over hours of play is delicate. I have worked on the progression timing, but for now it gets stale quickly: I need more systems to keep the experience fresh and interesting to play. Every upgrade has to feel earned without making the player wait around for nothing, and small tweaks to the math completely change how the game feels. It runs on TypeScript and Vite with vanilla DOM and saves in localStorage.

Website: [coder.pantoine.com](https://coder.pantoine.com)\
Repo: private for now

## Gauche / Droite

<img src="/blogfiles/gauche-droite.webp" alt="Gauche / Droite vote screen, with the word Ramen between the left and right panels"/>

Gauche / Droite is a much smaller experiment, and it is live. You get 10 words out of a pool of roughly 700 common French words and brands, and you have to sort each one into "left" or "right". After each vote, you see how the community split, and at the end you get an archetype.

Technically, it is simple: vanilla JavaScript, Cloudflare Workers, and D1. From a design standpoint, there is no simulation and no progression curve at all. The fun comes entirely from the friction between your own instincts, French cultural clichés, and what everyone else voted. Sometimes the simplest loop is the one that works best.

Website: [gauchedroite.pantoine.com](https://gauchedroite.pantoine.com)\
Repo: [github.com/gimk/gauchedroite](https://github.com/gimk/gauchedroite)

## What's next

All three projects sit at very different stages, and each one is teaching me a different side of game design: turning a simulation into a game with Transit Flow, balancing numbers and pacing with Clicker Code, and building around a quick social loop with Gauche / Droite. Next up is adding new systems to keep Clicker Code fresh, building the UI and tools for Transit Flow, and slowly shaping it from a traffic sandbox into an actual game. Gauche / Droite is done as a game; now I need to share it around and see what the votes say once enough people have played.
