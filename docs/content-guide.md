# Content guide

You change the site by editing files. You do not edit any React code.

- Projects live in `src/content/projects/`. One `.md` file per project.
- Certifications live in `src/content/certifications.ts`. One object per certification.

After any change, run `npm run build`. If the content is wrong, the build fails and names the file.

## Projects

### Add a project

1. Make a file `src/content/projects/my-project.md`. The file name is the slug. It becomes the URL: `/projects/my-project`.
2. The slug may use only lowercase letters, digits and hyphens.
3. Paste the frontmatter from the example below. Fill in the required fields.
4. Run `npm run build`.

### Edit a project

Change the file. Save. That is all.

### Hide a project from the home page

Set `home: false`, or delete the `home` and `homeOrder` lines. The project stays on `/projects`.

### Remove a project

Delete its `.md` file. Delete its folder `public/images/projects/<slug>/` too. There is no other switch to hide a project from `/projects`. Delete the file, or move it out of `src/content/projects/`.

### Frontmatter fields

Frontmatter is the block between the two `---` lines at the top of the file.

| Field | Required | What it does | Example |
| --- | --- | --- | --- |
| `name` | yes | Project name | `name: Tachyon` |
| `summary` | yes | One line on cards | `summary: A performance testing intelligence platform.` |
| `description` | no | Longer subtitle on the project page | `description: Performance Testing Intelligence Platform` |
| `category` | yes | Filter group. Exactly one of: `Systems & backend`, `Full-stack & AI`, `Web apps` | `category: Systems & backend` |
| `order` | yes | Whole number. Sorts `/projects`. Must be unique | `order: 1` |
| `home` | no | `true` shows it on the home page. Default `false` | `home: true` |
| `homeOrder` | if `home: true` | Whole number. Sorts the home list. Must be unique | `homeOrder: 1` |
| `stack` | yes | At least one tool name | `stack: [.NET, React, PostgreSQL, Docker]` |
| `repoUrl` | no | Source code link. Must start with `https://` | `repoUrl: https://github.com/jnrgxx/Tachyon` |
| `liveUrl` | no | Live site link. Must start with `https://` | `liveUrl: https://example.com` |
| `private` | no | `true` marks the code as private. Default `false` | `private: true` |
| `extraLinks` | no | More links, each with a `label` and an `https://` `url` | see below |
| `role` | no | Your role | `role: Solo builder` |
| `period` | no | When you built it | `period: 2025` |
| `cover` | no | Big image or video: `image`, `video`, `poster` | see below |
| `thumbnail` | no | Small card image | `thumbnail: /images/projects/tachyon/thumb.webp` |
| `gallery` | no | List of `src` and `caption` | see below |
| `approachDiagram` | no | Diagram image for the case study | `approachDiagram: /images/projects/tachyon/flow.svg` |

Examples for the list fields:

```yaml
extraLinks:
  - label: Write-up
    url: https://example.com/post
cover:
  image: /images/projects/tachyon/cover.webp
  video: /images/projects/tachyon/demo.mp4
  poster: /images/projects/tachyon/poster.webp
gallery:
  - src: /images/projects/tachyon/dashboard.webp
    caption: The run dashboard
```

If an optional field is missing, that part of the page is hidden. No placeholder text shows.

### Images

Every image path must start with `/images/projects/<slug>/`. The `<slug>` is the file name of the project. Put the real files in `public/images/projects/<slug>/`. A path outside that folder fails the build.

The build also checks that each image file exists in `public/`. The content step of the build (`vite build` reads and checks every project file) fails and names the file, the field and the missing path.

### Case study (the file body)

The text under the frontmatter is the case study. It is optional. Leave it empty to hide the case study.

Use only these `##` headings. Each may appear once:

- `## Problem` (required)
- `## Approach` (required)
- `## What I built` (required)
- `## Results` (optional)
- `## Learned` (optional)

If you write a body, you must include the three required sections. Plain text before the first `##` heading is not allowed. Body text is Markdown.

## Certifications

Open `src/content/certifications.ts`. Each certification is one object in the `all` list. The site sorts them newest first. Items without `issued` go last.

### Add a certification

Copy an existing object. Change the values. Use a new unique `id` with only lowercase letters, digits and hyphens. The `id` is the URL: `/certificates/<id>`. Run `npm run build`.

### Edit, hide or remove

- Edit: change the object.
- Hide from the home page: delete `home` and `homeOrder`, or set `home: false`. It stays on `/certificates`.
- Remove: delete the object.

### Fields

| Field | Required | What it does | Example |
| --- | --- | --- | --- |
| `id` | yes | URL slug. Unique | `id: 'ccst-cybersecurity'` |
| `name` | yes | Full title | `name: 'Cisco Certified Support Technician Cybersecurity'` |
| `shortName` | no | Short title for cards | `shortName: 'CCST Cybersecurity'` |
| `issuer` | yes | Who issued it | `issuer: 'Cisco'` |
| `via` | no | Platform that delivered it | `via: 'Certiport'` |
| `issued` | no | Month as `YYYY-MM` | `issued: '2025-04'` |
| `verifyUrl` | no | Link to verify it | `verifyUrl: 'https://www.credly.com/badges/...'` |
| `verifyType` | no | One of `credly`, `coursera`, `linkedin`, `other` | `verifyType: 'credly'` |
| `scan` | no | Image of the certificate in `public/` | `scan: '/images/certificates/pcap.webp'` |
| `home` | no | `true` shows it on the home page | `home: true` |
| `homeOrder` | no | Sort order on the home page | `homeOrder: 1` |

Without a `scan`, the site shows the issuer name on a plain card. Without `verifyUrl`, the verify button is hidden.

A `scan` path must start with `/` and the file must exist in `public/`. The build checks this.

## What fails the build

The build stops and prints the file name and field. These fail it:

- A required project field is missing or empty (for example `summary:` with no value).
- `category` is not one of the three allowed values.
- `order` is used by two projects. `homeOrder` is used by two home projects.
- `home: true` with no `homeOrder`.
- More than 5 projects with `home: true`.
- A URL that does not start with `https://`.
- A slug with capitals, spaces or symbols.
- An image path outside `/images/projects/<slug>/`.
- A case study heading that is not in the allowed list, a repeated heading, or a missing required section.
- Text in the body before the first `##` heading.
- An image file that is not in `public/` (project images and certification `scan`).
- A certification `id` that is used twice, or that has capitals, spaces or symbols.
- A certification `issued` value that is not `YYYY-MM`.
- More than 3 certifications with `home: true`, or two home certifications with the same `homeOrder`.
