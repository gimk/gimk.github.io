---
title: "Bankin' second year"
description: "In-depth redesign and new features"
date: "July 2023"
---

![Cover showing a mockup of the redesigned transactions screen](/projectfiles/bankin/transaction-redesign.png)

Second year working at Bankin' as a Product Designer.

Since my first year at the company the Product team grew quite a bit. We are now 6 people, including 3 full time PMs and one Intern PM, the CPO and myself (still) the only Product Designer.

Three times more PM means of course a lot more work on my side, and it's getting harder and harder to keep a clear design vision of the future of the application, but I think I still managed to make it work.

As said previously, I'm the only Product Designer at Bankin' so all designs are my own.

## Transaction Page and Detail

While not particularly complicated design-wise, being primarily a UI redesign, this project still has been going since a year now, and it's not even available on Android at the time of writing. The cause for this is only because of development issues, and roadmap prioritisation, not the design.

The idea was to make the interface more modern, to go with the redesigned home page of the app from last year [here](/projects/bankin-year-1/).

> This is the state of the transaction tab, before any redesign.

<div class="mx-24"><img src="/projectfiles/bankin/transactions-old.png" alt="Old transactions design view"/></div>

While perfectly fine in UX terms, the UI from 2015 is a bit lacking now, so I needed to propose and design an alternative, that you can see below.

<div class="md:-mx-32"><img src="/projectfiles/bankin/transactions-new1.png" alt="New transaction design"/></div>

You can notice there's a lot going on in those transactions, that's because I took every type of transaction into account. Also, a new feature has been added during the redesign : the daily amount. With this you can quickly figure out how much you did spend during a day.

With that comes the redesign of the transaction detail, as you can see below.

<div class="mx-20"><img src="/projectfiles/bankin/transactions-new2.png" alt="New transaction detail design"/></div>

## In-app Loans

The first big project of 2023 was the implementation of loans inside the app. Bankin' already offered small and quick loans but this new and improved version allows more flexibility and control for the user. The full flow can be separated in three parts : subscription, withdrawal and management.

The subscription is pretty straightforward: it's a 5 part form with personal informations, ID check and a few settings.

<div class="md:-mx-32"><img src="/projectfiles/bankin/inapp-loans1.png" alt="New in-app loan funnel design"/></div>

Once that's done and your file is accepted, you gain access to withdrawal and management of your subscription.

<div class="md:-mx-32"><img src="/projectfiles/bankin/inapp-loans2.png" alt="New in-app loan results design"/></div>

The last screens of this feature are the loan management ones below. The way the "Crédit Renouvelable" works can be a bit complicated so I had to take multiple use-cases into account while designing.

They allow you to make a new withdrawal, and see in detail all your current and past withdrawals. With that type of loan you actually have a total amount of $3000 available, that you can withdraw all at once, or in multiple instances. Each loan repayment is cumulative, so I had to make clear what had to be payed and when.

<div class="md:-mx-32"><img src="/projectfiles/bankin/inapp-loans3.png" alt="New in-app loan results design"/></div>

## Boosted Cashback

![Cover showing a mockup of the new boosted cashback screen](/projectfiles/bankin/boost-cashback1.png)

Another big project for this year is the addition of a "Boost" feature to our cash back section of the app.

The concept is simple : instead of having fixed offers for our brands, we give a virtual coin to the user, that he can use on whatever brand he'd like. That coin boost the cash back on that brand for a month, and is locked until it expires. Then you can have it back and use it elsewhere.

Bankin' is a big app now, with dozen of functionnalities that are widely different from one another. It's getting harder and harder to keep the design consistent, and to make each feature coherent yet visible enough.

<div class="flex justify-center">
  <video controls width="429" height="853">
    <source src="/projectfiles/bankin/boost-cashback-vid.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</div>

There are a lot of implications to this design elsewhere on the cashback tab, but they are not very interesting, design wise.

## Savings Tab

During the last few months, we had a big focus on the new Savings tab. This tab goal is to help users monitoring how they are spending in comparison to their revenues, and help them save money on the long run. From that statement, I designed two sub-tabs.

<div class="md:-mx-32"><img src="/projectfiles/bankin/savings-tab1.png" alt="New savings tab design"/></div>

The first sub-tab here, is about keeping an eye on your spendings on a weekly basis. Here, you can define a savings goal, using diverse presets to help you know how how to split your revenues. We'll then take the goal into account in that gauge on the left, telling you how much you can still spend this month.

This sub-tab updates dynamically and is all about increasing the feature's stickiness.

<div class="md:-mx-32"><img src="/projectfiles/bankin/savings-tab2.png" alt="New savings tab design"/></div>

The second sub-tab of this feature is where the user can take action on his savings. Here, you can define an invest profile, telling us how open you are with risk, what type of investments could interest you, and how knowledgable you are with finance.

Then, with this info we assign a profile to you, and use it to give you insights or alerts on your savings.

Bankin' is originally a fun and simplified finance app, so the whole interface here is made to reflect that. I used a colorful palette, and bold elements, to bring only the useful information to the user.

This feature should be live in its final version around the end of 2023.
