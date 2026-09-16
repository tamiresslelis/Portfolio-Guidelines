import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createTanStackRouter({
    routeTree,
    // Mirrors whatever `base` vite.config.ts resolved at build time (Vite
    // always exposes it here, no manual syncing needed) — required so the
    // router matches routes correctly when the app is served from a
    // subpath, e.g. GitHub Pages' `/<repo-name>/`.
    basepath: import.meta.env.BASE_URL,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
