import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves project sites from a `/<repo-name>/` subpath, not the
// domain root, so every asset/route URL needs that prefix baked in at build
// time. `GITHUB_REPOSITORY` ("owner/repo") is a variable GitHub Actions sets
// automatically on every run — reading it here means the correct base path
// falls out of CI for free, with no repo name hardcoded anywhere and no env
// var to remember to set in the workflow. Locally (where it's unset) this
// resolves to "/", so `npm run dev`/`npm run build` behave exactly as before.
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = repoName ? `/${repoName}/` : "/";

export default defineConfig({
  base,
  resolve: { tsconfigPaths: true },
  // Always emit real, independently cacheable asset files instead of
  // inlining small ones as base64/data: URIs — a CSS `background-image`
  // set to a data: URI can silently fail to render under some browser
  // security configurations, which a background-cover wallpaper depends on.
  build: { assetsInlineLimit: 0 },
  plugins: [
    tailwindcss(),
    tanstackStart({
      // GitHub Pages can't run the Node/fetch server TanStack Start builds
      // by default (dist/server/server.js) — it only serves static files.
      // `prerender: { enabled: true }` makes `vite build` instead render
      // the app's one route ("/") to a real dist/client/index.html at
      // build time (still needs dist/server/ internally to do that
      // rendering — it's just never deployed). The browser then hydrates
      // that exact markup and takes over normally, same as any other
      // client-rendered route change from there. There's nothing
      // server-only in this app (no loaders, no server functions, no
      // APIs) for a build-time snapshot to miss.
      prerender: { enabled: true },
      router: { basepath: base },
    }),
    viteReact(),
  ],
});
