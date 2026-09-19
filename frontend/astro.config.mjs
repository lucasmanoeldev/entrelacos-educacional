import { defineConfig } from 'astro/config';
export default defineConfig({
  output: 'static',
  outDir: './out',
  trailingSlash: 'always',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // Compatibility with the existing Render service; PUBLIC_API_URL is preferred.
  vite: { define: { 'import.meta.env.PUBLIC_LEGACY_API_URL': JSON.stringify(process.env.NEXT_PUBLIC_API_URL || '') } },
});
