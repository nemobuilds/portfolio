---
name: Endpoint
summary: API Health Monitor
description: Scheduled uptime and response-time checks for HTTP endpoints
categories: [Full-Stack Applications, Backend & APIs, Personal Projects, Open Source, Developer Tools, Cloud & Infrastructure]
date: 2026-09
order: 1
home: true
homeOrder: 1
stack: [Spring Boot, Next.js, React, Tailwind CSS, PostgreSQL, Docker, Git]
repoUrl: https://github.com/nemobuilds/api-health-monitor
role: Solo builder
period: September to November 2026

thumbnail: /images/projects/endpoint/hero.webp
cover:
  image: /images/projects/endpoint/details.webp
approachDiagram: /images/projects/endpoint/flow.svg
gallery:
    - src: /images/projects/endpoint/dashboard.webp
      caption: Dashboard
    - src: /images/projects/endpoint/history.webp
      caption: Endpoint uptime history
    - src: /images/projects/endpoint/signin.webp
      caption: The signin page
---
## Problem

Small teams often learn that an API is down from their users. Hosted monitors work, but they cost money per check, hide the raw data, and are awkward to run next to a side project. I wanted a monitor I could run myself: add a URL, say how often to check it and what status to expect, and see at a glance which endpoints fail and how slow they are.

## Approach

I split the work into an API and a dashboard, so each part stays simple.

- A **Spring Boot API** owns the monitored endpoints, the check schedule and the stored results.
- A **check scheduler** inside the API wakes up every 10 seconds, picks the endpoints that are due, and sends each one an HTTP request. It records the status code, the response time and whether the status matched the expected one, then schedules the next check after that endpoint's own interval.
- **PostgreSQL** keeps every check result, so the dashboard can show history instead of only the latest state.
- A **Next.js dashboard** reads the API and shows health, uptime and response time from 6 hours to 30 days.

The diagram shows how a check moves through the system.

## What I built

- **Endpoint setup:** a name, URL, method, expected status, check interval and an on/off switch for each endpoint. The REST API validates new and changed endpoints (name, URL and method are required) and rejects the same URL and method twice.
- **Scheduler:** every 10 seconds it finds the endpoints whose next check is due, checks them, and moves each one's next check forward by its interval. Connect and read timeouts (60 seconds) stop a dead endpoint from hanging the scheduler.
- **Result store:** one row per check with the status code, the response time in milliseconds, up or down, and the time of the check.
- **Dashboard:** a health summary, a response-time chart (bars, line and check strip), an uptime figure and a recent-checks table with the error for each failure.
- **Sign-in**, so only the owner can see and change the monitored endpoints.
- **Docker**, to run the dashboard, the API and the database together.

## Results

- Failing checks show the exact cause (for example "expected 200, got 503"), so a failure points to the fix.
- The history view makes slow trends visible before they become outages.

## Learned

- Scheduling is the hard part of a monitor. Due times, timeouts and what happens when a check is slow matter more than the user interface.
- Storing raw check results first, and computing uptime from them later, keeps the data honest and makes new charts cheap to add.
- Next: run checks in parallel so one slow endpoint never delays the others, and push live updates to the dashboard over WebSocket.
