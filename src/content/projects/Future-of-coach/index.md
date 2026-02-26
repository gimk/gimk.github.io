---
title: "Future of Coach"
description: "A modern vision for the Younited app."
date: "June 15 2024"
thumbnail: "/projectfiles/thumbnails/coach-thumbnail.png"
demoURL: "https://www.figma.com/proto/MQtL93liBRA63HQ11iZa5j/Future-of-Coach-(Copy)?page-id=2%3A15&node-id=3-74499&node-type=canvas&viewport=-11533%2C-1257%2C0.82&t=x6nHlUpV0nzDfHer-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=3%3A74499&show-proto-sidebar=1"
---

![Future of coach cover](/projectfiles/coach/future-of-coach-cover.png)

At first, _Future of coach_ was only about the vision of Younited personal budget feature. During the couple of weeks needed for this project though, the scope increased tremendously.

It was always the goal to make extensive use of modern gen AI features, but we went beyond that and made a complete new app, made from the ground up for banking features, loans (our core business), and budgeting.

After an initial brief and brainstorming from the CPO, I had to imagine, prioritize, and design three personas and their experience with a totally revamped Younited Coach experience, during 12 intense days. The project wasn't really supposed to be this big, but I saw it as an opportunity to materialize some ideas and concepts I imagined during my previous work at Bankin', plus a healthy dose of modern AI interactions.

![Future of coach project page](/projectfiles/coach/home-app-page1.png)

<div class="text-center md:mx-16 mb-16 border rounded-2xl bg-black/5 border-black/25 dark:border-white/25 p-4 gap-2">
    <svg class="inline-block" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_4021_23699)"> <path class="stroke-black/75 dark:stroke-white/75" d="M12 10L8 6L4 10" stroke="" stroke-linecap="round" stroke-linejoin="round"/></g><defs> <clipPath id="clip0_4021_23699"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>
    <p class="mt-1">Above is the home page of the app. As you can see, the navigation is peculiar, with 3 buttons. The left one goes to Projects, and the right one goes to the Timeline. We'll see about the chat button later.</p>
</div>

![Future of coach project page](/projectfiles/coach/home-app-page2.png)

## Projects

The Project page is there to follow your current loans, savings goals and financed transactions.
Tapping on a project, shows a lot of information, tasks, guides, etc. depending on the type.

<div class="flex gap-6 my-12 mx-8">
    <div class=""><img src="/projectfiles/coach/savings1.png" alt="savings details"/></div>
    <div class=""><img src="/projectfiles/coach/savings2.png" alt="savings details"/></div>
</div>

To create a project, there are two ways. The manual method involves tapping 'Create a new project,' then filling in the fields and saving. The other, much more interesting, is to press the Chat button and ask the AI Assistant for help.

<div class="flex gap-6 my-12 mx-8">
    <div class=""><img src="/projectfiles/coach/project1.png" alt="project creation details"/></div>
    <div class=""><img src="/projectfiles/coach/project2.png" alt="project creation details"/></div>
</div>

Both are very similar in essence, after all creating a project isn't very complicated in this app. But the Assistant can propose various possibilities to a single problem, and give creative suggestions.

As you can see on the first screen below, the chat appears above the screen, anywhere on the home page. It's similar to the way Gemini is presented on a Pixel phone.

<div class="flex gap-4 md:gap-6 md:my-12 md:-mx-24">
    <div class=""><img src="/projectfiles/coach/ia-project1.png" alt="ia assistant suggesting project creation"/></div>
    <div class=""><img src="/projectfiles/coach/ia-project2.png" alt="ia assistant suggesting project creation"/></div>
    <div class=""><img src="/projectfiles/coach/ia-project3.png" alt="ia assistant suggesting project creation"/></div>
</div>

Obviously I'm skipping steps with my screens here. You would have to subscribe to a loan at some point, and sign a contract, etc.

## Timeline

The Timeline page is very useful to keep an eye on the overall health of your finances. It keeps track of your expenses for the current month and calculates an overdraft probability before its end.

It’s also the place to keep track of your recurring expenses. One fun feature here is the _AI-powered Subscription Manager_, using our subtly named AI, **CoachAI**.

<div class="flex gap-4 md:gap-6 md:my-12 md:-mx-24">
    <div class=""><img src="/projectfiles/coach/recurring1.png" alt="ia assistant suggesting ways to reduce recurring expenses"/></div>
    <div class=""><img src="/projectfiles/coach/recurring2.png" alt="ia assistant suggesting ways to reduce recurring expenses"/></div>
    <div class=""><img src="/projectfiles/coach/recurring3.png" alt="ia assistant suggesting ways to reduce recurring expenses"/></div>
</div>

Everything has its own loading, to make the experience as realistic as possible. You can check this in the third persona of the prototype available at the top of this page.

## Widgets & Home page

Being widget-based, the Home page is designed for high customizability; almost any element can be moved or replaced. This is reflected in the prototype, where each of the three personas has a unique Home page layout.

At the center of this experience, is the chat with CoachAI, available anywhere and ready to answer any of your questions. See below an example of an interaction.

<div class="flex gap-4 md:gap-6 md:my-12 md:-mx-24">
    <div class=""><img src="/projectfiles/coach/ia-talk1.png" alt="ia assistant answering questions about finance and travels"/></div>
    <div class=""><img src="/projectfiles/coach/ia-talk2.png" alt="ia assistant answering questions about finance and travels"/></div>
    <div class=""><img src="/projectfiles/coach/ia-talk3.png" alt="ia assistant answering questions about finance and travels"/></div>
</div>

At the top of the page, you have the classic banking/aggregation experience, with all your connected accounts listed. You can add or remove banks as you wish, using open banking technologies.

<div class="flex gap-4 md:gap-6 md:my-12 md:-mx-24">
    <div class=""><img src="/projectfiles/coach/add-bank1.png" alt="connect a new bank to your coach app"/></div>
    <div class=""><img src="/projectfiles/coach/add-bank2.png" alt="connect a new bank to your coach app"/></div>
    <div class=""><img src="/projectfiles/coach/add-bank3.png" alt="connect a new bank to your coach app"/></div>
</div>

It's quite easy now, especially on mobile, where you just have to open your bank app and accept the connection.

You also have your list of recent transactions, which I won't show here as it's a rather boring design. That said, there is one interesting feature I want to highlight: _Who is this?_

We've all had that moment when you see a transaction from a week ago and you just can't recall the source. Well, with _Who is this?_, CoachAI can find out – through a simple Google search, really – who on earth it is and keep that information visible for the next time you forget.

_Sigh_, I wish the transaction names were more explicit.

<div class="flex gap-4 md:gap-6 md:my-8 md:-mx-24">
    <div class=""><img src="/projectfiles/coach/transac-find1.png" alt="Ask coachai to find what the hell is this transaction"/></div>
    <div class=""><img src="/projectfiles/coach/transac-find2.png" alt="Ask coachai to find what the hell is this transaction"/></div>
    <div class=""><img src="/projectfiles/coach/transac-find3.png" alt="Ask coachai to find what the hell is this transaction"/></div>
</div>

The rest of the Home page and widgets is straightforward. We have widgets to categorize transactions, show your monthly savings, but also widgets for your carbon footprint, credit score, future expenses, and so on.

<div class="flex gap-2 md:gap-4 md:my-8 md:-mx-24">
    <div class=""><img src="/projectfiles/coach/features1.png" alt="A screenshot of a widget on the home page"/></div>
    <div class=""><img src="/projectfiles/coach/features2.png" alt="A screenshot of a widget on the home page"/></div>
    <div class=""><img src="/projectfiles/coach/features3.png" alt="A screenshot of a widget on the home page"/></div>
    <div class=""><img src="/projectfiles/coach/features4.png" alt="A screenshot of a widget on the home page"/></div>
    <div class=""><img src="/projectfiles/coach/features5.png" alt="A screenshot of a widget on the home page"/></div>
</div>

Naturally, the best way to truly appreciate the effort invested in this project is to use the [**full prototype**](<https://www.figma.com/proto/MQtL93liBRA63HQ11iZa5j/Future-of-Coach-(Copy)?page-id=2%3A15&node-id=3-74499&node-type=canvas&viewport=-11533%2C-1257%2C0.82&t=x6nHlUpV0nzDfHer-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=3%3A74499&show-proto-sidebar=1>). Be aware, though, that navigating them can be a little challenging. These are scenarized prototypes based on personas, but you should still be able to easily observe most of the features mentioned above.

<div class="flex justify-center">
    <iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="450" height="800" src="https://embed.figma.com/proto/MQtL93liBRA63HQ11iZa5j/Future-of-Coach--Copy-?page-id=2%3A15&node-id=3-74499&p=f&viewport=-176%2C148%2C0.1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=3%3A74499&show-proto-sidebar=1&embed-host=share" allowfullscreen></iframe>
</div>

Thank you for reading!
