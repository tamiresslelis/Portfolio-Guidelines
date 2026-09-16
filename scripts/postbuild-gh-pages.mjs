// Turns TanStack Start's prerendered build output into a directory any
// static host (GitHub Pages included) can serve directly, with no server
// involved.
//
// `prerender: { enabled: true }` in vite.config.ts makes `vite build`
// render the app's one route ("/") to a real dist/client/index.html at
// build time — actual markup, not a placeholder shell, since there's
// nothing server-only in this app (no loaders, no server functions, no
// APIs) for a build-time snapshot to miss. The browser then hydrates that
// exact markup and takes over normally.
//
// The only thing left to add is GitHub Pages' well-known SPA fallback:
// when a request doesn't match a real file (e.g. reloading a client-side
// route, or a future deep link), GitHub Pages serves 404.html instead of a
// bare 404. Copying index.html there means the app still boots normally
// and the router takes it from there — this is what actually prevents
// "routes 404 after refresh" on GitHub Pages.
//
// It also drops a `.nojekyll` file, which tells GitHub Pages not to run its
// default Jekyll processing over the output — Jekyll ignores files/folders
// starting with `_` by convention, which would silently break any future
// build output shaped that way.
import { copyFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const clientDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "dist",
  "client",
);
const indexPath = path.join(clientDir, "index.html");

if (!existsSync(indexPath)) {
  console.error(
    `[postbuild-gh-pages] Expected ${indexPath} to exist — did vite.config.ts's ` +
      `"prerender: { enabled: true }" option get removed, or did the build layout change?`,
  );
  process.exit(1);
}

await copyFile(indexPath, path.join(clientDir, "404.html"));
await writeFile(path.join(clientDir, ".nojekyll"), "");

console.log("[postbuild-gh-pages] Wrote 404.html and .nojekyll to dist/client/");
