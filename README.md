# 🏮 Shiori - Starter Template for Personal Blogs

Shiori is a high-performance, premium personal blog template built with Astro. It's designed for creators who want a minimalist, Time Capsule style blog that is easy to customize and deploy.

This project is built to be a **ready-to-use template**. You can clone it, change a few settings, and have your own professional blog live in minutes.

---

## Features

- **Threaded Conversations**: A clean and organized comment system that lets readers follow discussions easily without the layout becoming cluttered.
- **Instant Interaction**: Features real-time notifications (Success/Error toasts) so users get immediate feedback when they join the conversation.
- **One-Click Login**: Readers can join instantly using their Google account or a simple registration, making it easy to build a community.
- **Nice Reading Experience**: Optimized for focus with elegant typography and a Glassmorphism aesthetic that looks stunning on phones, tablets, and computers.
- **Effortless Writing**: A powerful built-in editor for the owner to write, format, and upload images to their blog as easily as using a word processor.

---

## Tech Stack

- **Framework**: Astro 5.0+
- **Database**: Astro DB (SQLite)
- **Authentication**: Auth-Astro (Auth.js)
- **Frontend Logic**: React (for interactive components)
- **Testing**: Vitest
- **Editor**: Tiptap (Headless Rich Text Editor)
- **Image Hosting**: Cloudinary & ui-avatars.com
- **UI and Styling**: Vanilla CSS
- **Notifications**: React Hot Toast

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/snui1s/Shiori-Blog.git
cd web-blog
bun install # or npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory and add your credentials. **Do not commit this file to version control!**

```env
# --- Admin & Dashboard ---
# Your email used to identify the administrator/owner
ADMIN_EMAIL=your_email@gmail.com

# --- Database (Turso for Remote, SQLite for Local) ---
# For local dev, you don't need these. For remote:
# ASTRO_DB_REMOTE_URL=libsql://your-db-name.turso.io
# ASTRO_DB_APP_TOKEN=your_turso_auth_token

# --- Cloudinary (Image Uploads) ---
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset

# --- Authentication (Auth.js / Google OAuth) ---
AUTH_SECRET=a_random_32_character_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Run Development Server

```bash
bun run dev # or npm run dev
```

### 4. Run Tests

```bash
bun test # runs vitest
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

This template is optimized for **Vercel** with **Turso** (LibSQL) as the remote database.

### 1. Database Setup (Turso)

1. Create a database on [Turso](https://turso.tech/).
2. Get your **Database URL** and **Auth Token**.
3. Push your schema to the remote database:
   ```bash
   bun astro db push --remote
   ```

### 2. Cloudinary Setup (for Image Uploads)

1. Sign up/Login at [Cloudinary](https://cloudinary.com/).
2. Copy your **Cloud Name** from the dashboard.
3. Go to **Settings** (gear icon) -> **Upload** tab.
4. Scroll down to **Upload presets** and click **Add upload preset**.
5. Change **Signing Mode** from "Signed" to **Unsigned**.
6. Set the **Upload preset name** (or use the generated one) and click **Save**.
7. Copy the **Cloud Name** and **Upload preset name** to your environment variables.

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project.
3. Search for **"APIs & Services"** -> **"OAuth consent screen"**.
4. Set User Type to **External**, fill in the required app information, and add your email.
5. Go to the **"Credentials"** tab -> **"Create Credentials"** -> **"OAuth client ID"**.
6. Select Application Type: **Web application**.
7. Add **Authorized JavaScript origins**:
   - `http://localhost:4321`
   - `https://your-domain.vercel.app` (your production URL)
8. Add **Authorized redirect URIs**:
   - `http://localhost:4321/api/auth/callback/google`
   - `https://your-domain.vercel.app/api/auth/callback/google`
9. Copy your **Client ID** and **Client Secret** to your environment variables.

### 4. Vercel Deployment

1. Push your code to a GitHub repository.
2. Import the project into **Vercel**.
3. Add the following **Environment Variables**:
   - `ADMIN_PASSWORD`: Your dashboard password.
   - `AUTH_SECRET`: A random string for session encryption. (Use `openssl rand -base64 32` to generate one)
   - `GOOGLE_CLIENT_ID`: From Google Cloud Console.
   - `GOOGLE_CLIENT_SECRET`: From Google Cloud Console.
   - `ASTRO_DB_REMOTE_URL`: Your Turso Database URL.
   - `ASTRO_DB_APP_TOKEN`: Your Turso Auth Token.
   - `PUBLIC_CLOUDINARY_CLOUD_NAME`: Your Cloudinary Cloud Name.
   - `PUBLIC_CLOUDINARY_UPLOAD_PRESET`: Your **Unsigned** Upload Preset.

Vercel will automatically detect Astro and deploy your server-side blog!

---

## Author's Note

Hello! I hope you like this project. If you are looking to start your own blog, please feel free to clone this repository and customize it into your own version. I would be more than happy to help you create your very own Time Capsule to document your life's journey.

---
