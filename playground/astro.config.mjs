import path from 'node:path';
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

const root = path.resolve('..');

export default defineConfig({
  integrations: [vue()],
  devToolbar: {
    enabled: false,
  },
  srcDir: './www',
  vite: {
    resolve: {
      alias: {
        'position-tracker': path.resolve(root, 'dist/position-tracker.mjs'),
        'position-tracker/vue': path.resolve(root, 'dist/position-tracker-vue.mjs'),
      },
    },
  },
});