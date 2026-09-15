import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  // Always emit real, independently cacheable asset files instead of
  // inlining small ones as base64/data: URIs — a CSS `background-image`
  // set to a data: URI can silently fail to render under some browser
  // security configurations, which a background-cover wallpaper depends on.
  build: { assetsInlineLimit: 0 },
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
});
