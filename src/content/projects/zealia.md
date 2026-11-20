---
name: Zealia
summary: Builds research teams and assigns roles, using sorting algorithms.
description: Team composition and role assignment web application for computing research using sorting algorithms.
categories: [Full-Stack Applications, Academic, Education & Teams]
date: 2024-07
order: 4
home: true
homeOrder: 2
stack: [PHP, Composer, JavaScript, HTML, Tailwind CSS, Git]
repoUrl: https://github.com/jnrgxx/Zealia

extraLinks:
  - label: AVP
    url: https://youtu.be/iL5rgT7N5IM

role: System architecture, UI/UX design, backend and frontend (team of 4)
period: July to December 2024 (BSCS thesis)

thumbnail: /images/projects/zealia/thumb.webp
cover:
  image: /images/projects/zealia/thumb.webp
approachDiagram: /images/projects/zealia/diagram.webp
gallery:
    - src: /images/projects/zealia/landing-guide.webp
      caption: The landing & about page
    - src: /images/projects/zealia/dashboard.webp
      caption: The rooms dashboard for students & teachers
    - src: /images/projects/zealia/admin-dashboard.webp
      caption: The admin dashboard
---
## Problem

Computing research groups at our university were formed by hand: friends grouped with friends, and roles went to whoever volunteered. Mismatched roles caused conflict and slowed the research down. Professors had no simple way to build balanced teams for a whole section, and students had no say based on what they actually like to do.

Zealia was our BSCS thesis: a web app that forms research teams and assigns each member a role that fits their interests.

## Approach

We based the matching on Holland's RIASEC model, which groups vocational interests into six types: Realistic, Investigative, Artistic, Social, Enterprising and Conventional.

- Students take a RIASEC interest test that we built into the app.
- Their raw results are stored in the database. Only the admin can see the raw data.
- A sorting algorithm turns each student's results into a ranked list of the four computing research roles: Principal Investigator, Research Writer, System Developer and System Designer.
- The app fills the roles across groups in that priority order, so every team gets a balanced set of roles.
- The team and role assignments appear on a dashboard for both the professor and the students.

We worked in an Agile cycle (requirements, design, development, testing, deployment, review) because the requirements changed as we learned from users.

## What I built

I drove the system architecture, the UI/UX design, and both the backend and frontend implementation.

- **Architecture.** An MVC structure in PHP: controllers handle requests, models own the MySQL data, and views render the pages.
- **Middleware and access control.** Middleware checks every request before it reaches a controller, including role-based access control (RBAC), so students, professors and the admin only reach their own pages and actions.
- **REST API.** The frontend talks to the backend through REST endpoints for accounts, rooms, join requests and team results.
- **Live updates.** Server-sent events (SSE) push changes from the server to the browser, so pages update without a manual refresh.
- **Accounts and rooms.** Students and professors register and verify their email (PHPMailer with Google SMTP). A professor creates a room per class and shares its code. Students request to join, and the professor admits or rejects them.
- **RIASEC test.** Our own version of the interest test, inside the app, with the result shown on the student's account page.
- **Role ranking.** For each student, the code scores every role from their ranked RIASEC preferences, normalizes the scores to a 0 to 10 scale, and sorts the roles from best to worst fit with merge sort.
- **Team builder.** The professor picks the number of groups, Zealia composes the teams and assigns roles, and the professor can adjust groups by hand.
- **Admin panel.** Totals for users, students, instructors and rooms, plus account and room records, support tickets, activity logs and settings.
- **Stack.** PHP with HTML for pages and the back end, Tailwind CSS for styling, JavaScript for interactivity, MySQL for data and Composer for dependencies.

## Results

We evaluated Zealia against the ISO 25010 software quality model with 154 third-year BSIT and BSCS students and a group of IT experts, on a 5-point scale.

- **Students:** functionality 4.62, usability 4.72, performance efficiency 4.65, security 4.68, portability 4.57, compatibility 4.55, maintainability 4.47 and reliability 4.46.
- **IT experts:** overall mean 4.71, rated "Highly Acceptable", with efficiency 5.00 and usability 4.90 as the highest scores.

The panel recommended the thesis for oral examination in December 2024.

## Learned

- **MVC architecture.** Separating models, views and controllers kept the codebase easy to change as requirements moved between Agile cycles.
- **Middleware.** Putting authentication and role-based access control (RBAC) in middleware means one place decides who can do what, instead of checks scattered through every page.
- **REST API design.** Clear resources and endpoints made the frontend and backend easier to build and test on their own.
- **Server-sent events.** SSE is a simple way to push live updates one way from server to browser, without the extra setup of WebSockets.
- Next steps from our thesis recommendations: support more programs (such as BSEMC) with their own roles, and add analytics to learn which team setups perform best.
