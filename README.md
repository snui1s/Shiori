# Shiori

A high-performance personal blog platform built with Astro. Designed for creators who value minimalist aesthetics, effortless writing, and genuine reader engagement.

Clone it. Configure it. Deploy it. Your blog is live.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Customization](#customization)
- [License](#license)

---

## Overview

Shiori (栞) means "bookmark" in Japanese — a small thing that holds your place in a larger story. This project is built as a ready-to-use blog template with a full authentication system, a rich text editor, threaded comments, and an admin dashboard out of the box.

It is optimized for Vercel with Turso (LibSQL) as the remote database, but can be adapted for other providers.

---

## Features

### For Readers

- **Threaded Conversations** — Nested comment system with reply support, keeping discussions organized and easy to follow.
- **Dynamic Search** — Powerful internal search that scans titles, excerpts, and full content to help readers find specific topics.
- **Instant Feedback** — Real-time toast notifications for every interaction (posting, replying, errors).
- **One-Click Login** — Sign in with Google OAuth or register with email/password. No unnecessary friction.
- **Responsive Design** — Fully optimized for mobile, tablet, and desktop with a dark glassmorphism aesthetic.

### For the Writer

- **Rich Text Editor** — A built-in Tiptap editor with formatting, image uploads, links, and color support.
- **Admin Dashboard** — Create, edit, and manage posts from a dedicated admin panel.
- **Comment Moderation** — Admins can delete any comment; users can delete their own.
- **Image Management** — Cloudinary integration for fast, optimized image hosting and delivery.

### Under the Hood

- **Server-Side Rendering** — Astro hybrid mode with selective client-side hydration for interactive components.
- **Dynamic Sitemap** — A custom database-driven `sitemap.xml` that ensures Google discovers every new post automatically.
- **Advanced SEO** — Comprehensive structured data (JSON-LD) for `BlogPosting` and `BreadcrumbList` to enhance search engine results.
- **Image Optimization** — Automatic Cloudinary transformations for responsive, optimized images.
- **Type Safety** — Full TypeScript coverage across API routes, components, and database queries.
- **Analytics Ready** — Integrated Google Analytics 4 (GA4) setup.

---

## Tech Stack

| Layer          | Technology                      |
| -------------- | ------------------------------- |
| Framework      | Astro 5                         |
| Database       | Astro DB (LibSQL / Turso)       |
| Authentication | Auth-Astro (Auth.js) + bcryptjs |
| UI Components  | React 19                        |
| Styling        | Tailwind CSS 4                  |
| Animations     | Framer Motion                   |
| Editor         | Tiptap (Headless Rich Text)     |
| Image Hosting  | Cloudinary                      |
| Notifications  | React Hot Toast                 |
| Testing        | Vitest                          |
| Deployment     | Vercel                          |

---

## Project Structure

```
src/
├── components/          # React and Astro components
│   ├── ui/              # Reusable UI primitives (Dropdown, etc.)
│   ├── Comments.tsx     # Threaded comment system
│   ├── BlogFeed.tsx     # Filterable post feed with pagination
│   └── ...
├── layouts/
│   └── Layout.astro     # Base layout (header, footer, meta, styles)
├── lib/                 # Shared utilities (image optimization, etc.)
├── pages/
│   ├── admin/           # Admin dashboard (new, edit, index)
│   ├── api/             # API routes (comments, posts, auth)
│   ├── blog/            # Blog listing and individual post pages
│   ├── index.astro      # Homepage
│   ├── profile.astro    # User profile page
│   ├── login.astro      # Login page
│   ├── signup.astro     # Registration page
│   ├── about.astro      # About the author
│   ├── privacy.astro    # Privacy policy
│   └── terms.astro      # Terms of service
├── tests/               # Test files
└── types.ts             # Shared TypeScript interfaces
db/
├── config.ts            # Database schema definition
└── seed.ts              # Seed data
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- A Google Cloud project (for OAuth)
- A Cloudinary account (for image uploads)
- A Turso database (for production deployment)

### 1. Clone and Install

```bash
git clone https://github.com/snui1s/Shiori-Blog.git
cd web-blog
bun install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# Admin
ADMIN_EMAIL=your_email@gmail.com

# Database (optional for local development)
# ASTRO_DB_REMOTE_URL=libsql://your-db.turso.io
# ASTRO_DB_APP_TOKEN=your_turso_token

# Cloudinary
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset

# Authentication
AUTH_SECRET=your_random_32_char_string
AUTH_TRUST_HOST=true
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Start Development Server

```bash
bun run dev
```

The site will be available at `http://localhost:4321`.

### 4. Run Tests

```bash
bun test
```

---

## Configuration

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services** > **OAuth consent screen**.
4. Set User Type to **External** and complete the required fields.
5. Go to **Credentials** > **Create Credentials** > **OAuth client ID**.
6. Select **Web application** as the application type.
7. Add **Authorized JavaScript origins**:
   - `http://localhost:4321`
   - `https://your-domain.vercel.app`
8. Add **Authorized redirect URIs**:
   - `http://localhost:4321/api/auth/callback/google`
   - `https://your-domain.vercel.app/api/auth/callback/google`
9. Copy the **Client ID** and **Client Secret** into your `.env` file.

### Cloudinary

1. Sign up at [Cloudinary](https://cloudinary.com/).
2. Copy your **Cloud Name** from the dashboard.
3. Go to **Settings** > **Upload** > **Upload presets**.
4. Create a new preset with **Signing Mode** set to **Unsigned**.
5. Copy the **Cloud Name** and **Preset name** into your `.env` file.

### Turso (Production Database)

1. Create a database at [Turso](https://turso.tech/).
2. Retrieve your **Database URL** and **Auth Token**.
3. Add both to your `.env` file.
4. Push the schema to the remote database:
   ```bash
   bun astro db push --remote
   ```

---

## Deployment

This project is configured for deployment on **Vercel**.

### Steps

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/).
3. Add the following environment variables in the Vercel dashboard:

   | Variable                          | Description                          |
   | --------------------------------- | ------------------------------------ |
   | `ADMIN_EMAIL`                     | Administrator email address          |
   | `AUTH_SECRET`                     | Random string for session encryption |
   | `AUTH_TRUST_HOST`                 | Set to `true`                        |
   | `GOOGLE_CLIENT_ID`                | From Google Cloud Console            |
   | `GOOGLE_CLIENT_SECRET`            | From Google Cloud Console            |
   | `ASTRO_DB_REMOTE_URL`             | Turso database URL                   |
   | `ASTRO_DB_APP_TOKEN`              | Turso authentication token           |
   | `PUBLIC_CLOUDINARY_CLOUD_NAME`    | Cloudinary cloud name                |
   | `PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset    |

4. Deploy. Vercel will automatically detect Astro and handle the build.

> To generate an `AUTH_SECRET`, run: `openssl rand -base64 32`

---

## Customization

Shiori is designed to be forked and personalized:

| What to Change   | Where                                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| Blog name        | `src/layouts/Layout.astro`, `src/pages/index.astro`                    |
| About page       | `src/pages/about.astro`                                                |
| Homepage content | `src/pages/index.astro`                                                |
| Theme colors     | CSS variables in `src/layouts/Layout.astro` — change `--color-primary` |
| Privacy / Terms  | `src/pages/privacy.astro`, `src/pages/terms.astro`                     |

---

## License

This project is open source and available for personal and commercial use. Feel free to clone, modify, and make it your own.

---

## Author's Note

Hello! I hope you like this project. If you are looking to start your own blog, please feel free to clone this repository and customize it into your own version. I would be more than happy to help you create your very own Time Capsule to document your life's journey.

---

Built by [snui1s](https://github.com/snui1s)
