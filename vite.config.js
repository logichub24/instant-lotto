import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: { outDir: 'dist', rollupOptions: { input: { index: resolve('index.html'), app: resolve('code_artifact (1).html') } } },
});
