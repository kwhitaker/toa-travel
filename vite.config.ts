import preact from "@preact/preset-vite";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    preact(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
      },
    }),
  ],
  css: {
    // Tachyons contains IE-only *zoom declarations. Modern browsers ignore
    // them; let Lightning CSS discard them during production minification.
    lightningcss: { errorRecovery: true },
  },
  server: {
    host: "localhost",
    port: 8080,
    strictPort: true,
    watch: { ignored: ["**/coverage/**", "**/dist/**"] },
  },
  preview: { host: "localhost", port: 4173, strictPort: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/main.tsx", "src/test/**", "src/vite-env.d.ts"],
    },
  },
});
