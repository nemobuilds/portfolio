---
name: AMBITION
summary: Makes balanced groups from MBTI personality types.
description: MBTI personalities balanced group matching application.
categories: [Frontend & UI/UX, Academic, Education & Teams]
date: 2023-12
order: 5
home: true
homeOrder: 5
stack: [JavaScript, HTML, CSS]
repoUrl: https://github.com/nemobuilds/ambition.github.io
liveUrl: https://ambition-beta.vercel.app/
period: December 2023 (Software Engineering 1)

thumbnail: /images/projects/ambition/landing.webp
cover:
  image: /images/projects/ambition/landing.webp
gallery:
    - src: /images/projects/ambition/create.webp
      caption: Create Groups page
    - src: /images/projects/ambition/mbti.webp
      caption: Learn MBTI page
    - src: /images/projects/ambition/about.webp
      caption: About page
---
## Problem

Group work in class usually starts the same way: students pick their friends, or the professor splits the list in order. Neither way looks at how people work together. We wanted a tool that helps professors and students form groups whose members fit well as a team.

## Approach

AMBITION was the website for our Software Engineering 1 title proposal. It used Myers-Briggs Type Indicator (MBTI) personality types to compose groups with members who complement each other.

We kept it front end only, with no backend or database, so the idea could be shown and tested quickly before we committed to a full system.

## What I built

- **Create Groups.** Enter the members and their MBTI types, choose how many groups you need, and get balanced groups.
- **Learn MBTI.** A page that explains the personality types, so users understand what the grouping is based on.
- **Landing and About pages.** What the tool does and why we made it.
- Plain HTML, CSS and JavaScript, deployed as a static site.

## Learned

AMBITION became the starting point for our thesis, [Zealia](/projects/zealia). The topic stayed the same: form better teams. For the thesis we replaced MBTI with the RIASEC interest model, which matches people to the kinds of work they like, and that maps more directly to research roles such as Principal Investigator or System Developer. Zealia also added what AMBITION left out: accounts, rooms, a database and role assignment.
