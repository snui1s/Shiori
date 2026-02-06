// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import db from '@astrojs/db';

import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';
import auth from 'auth-astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://shiori-blog.vercel.app', // TODO: Update with your domain
  integrations: [react(), db(), sitemap(), auth()],
  output: 'server',
  adapter: vercel(),
});