import { defineConfig } from 'tsdown'

const shared = {
  outDir: 'dist',
  target: 'es2022' as const,
  platform: 'browser' as const,
  format: 'esm' as const,
  sourcemap: true,
  outExtensions: () => ({ js: '.mjs', dts: '.d.ts' }),
}

export default defineConfig([
  // Alien signals
  {
    ...shared,
    entry: { 'position-tracker': 'packages/signal/index.ts' },
    dts: true,
    clean: true,
    deps: { neverBundle: ['alien-signals', 'position-tracker'] },
  },

  // Vue ESM
  {
    ...shared,
    entry: { 'position-tracker-vue': 'packages/vue/index.ts' },
    dts: { resolver: 'tsc' },
    clean: false,
    deps: { neverBundle: ['vue', 'position-tracker'] },
  },
])