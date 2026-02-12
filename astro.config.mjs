// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import db from "@astrojs/db";

import vercel from "@astrojs/vercel";

import auth from "auth-astro";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://shiori-blog.space",
  integrations: [react(), db(), auth()],
  output: "server",
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    domains: [
      "res.cloudinary.com",
      "ui-avatars.com",
      "placehold.co",
      "lh3.googleusercontent.com",
    ],
  },
});
