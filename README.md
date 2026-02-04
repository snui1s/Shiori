# 🏮 Shiori - Starter Template for Personal Blogs

Shiori is a high-performance, premium personal blog template built with Astro. It's designed for creators who want a minimalist, Time Capsule style blog that is easy to customize and deploy.

This project is built to be a **ready-to-use template**. You can clone it, change a few settings, and have your own professional blog live in minutes.

---

## Features

- **Visual Identity**: Animated Japanese Lantern icon (Chouchin) that swings and glows on hover.
- **Dynamic Now Section**: A randomized status section (listening, reading, mood) that updates on every page load.
- **Admin Dashboard**: A secure management interface for content creation (`/admin`).
  - **Tiptap Editor**: A rich text editor for seamless writing.
  - **Direct Cloudinary Upload**: Integrated image upload widget.
- **Astro DB Support**: Powered by Astro's fully integrated SQL database.
- **Search and Filters**: Robust search functionality and category filtering.
- **Mobile Optimized**: Fully responsive design with glassmorphism aesthetics.

---

## Tech Stack

- **Framework**: Astro
- **Database**: Astro DB (SQLite / Astro Studio)
- **Editor**: Tiptap (Headless Rich Text Editor)
- **Image Hosting**: Cloudinary
- **UI and Styling**: Vanilla CSS

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/snui1s/Shiori.git
cd web-blog
bun install # or npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory and add your credentials:

```env
# Admin Password for /admin access
ADMIN_PASSWORD=your_secure_password

# Cloudinary Credentials (for image uploads)
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

### 3. Run Development Server

```bash
bun run dev # or npm run dev
```

---

## How to Customize for Yourself

Shiori is designed to be easily personalized:

1. **Brand Name**: Change "Shiori" to your blog name in `src/layouts/Layout.astro` and `src/pages/index.astro`.
2. **About Me**: Update your bio, photo, and details in `src/pages/about.astro`.
3. **Now Section**: Change the randomized options (music, books, moods) at the top of `src/pages/index.astro`.
4. **Themes**: Colors are managed via CSS variables in `src/layouts/Layout.astro`. Simply change `--color-primary` to match your brand.

---

## Deployment

This template is optimized for **Vercel** + **Astro Studio**:

1. Push your code to GitHub.
2. Link your project to [Astro Studio](https://studio.astro.build/) for the database.
3. Deploy to Vercel and add your `.env` variables in the Vercel dashboard.

---

## Author's Note

Hello! I hope you like this project. If you are looking to start your own blog, please feel free to clone this repository and customize it into your own version. I would be more than happy to help you create your very own Time Capsule to document your life's journey.

---
