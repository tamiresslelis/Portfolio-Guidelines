# Acceptance Criteria

Status as of the current commit on `main`. Checked items were verified
directly (build output, `tsc`, file inspection, or a rendered/screenshotted
run of the app); the one open item is called out explicitly rather than
checked off without evidence.

## Project setup

- [x] **Project was created from scratch.** No pre-existing app code —
      started from an empty repo (`README.md` only) and scaffolded fresh.
- [x] **Project uses React.** `react` + `react-dom` (`package.json`).
- [x] **Project uses TypeScript.** All source is `.ts`/`.tsx`, compiled
      via `tsc -b` project references (`tsconfig.json`,
      `tsconfig.app.json`, `tsconfig.node.json`).
- [x] **Project uses Vite.** `vite.config.ts` + `@vitejs/plugin-react`;
      dev/build/preview all run through Vite.
- [x] **`npm install` works.** Verified clean install, 0 vulnerabilities.
- [x] **`npm run dev` starts the application.** Verified the dev server
      boots and serves the app (confirmed with an HTTP request and a
      headless-browser run against it).
- [x] **`npm run build` completes without errors.** Verified —
      `tsc -b && vite build` exits 0 and emits `dist/`.
- [x] **There are no TypeScript errors.** `npm run build` runs `tsc -b`
      with no `noEmit` escape hatch skipped — a type error fails the
      build, and the build passes.
- [x] **There are no unnecessary large dependencies.** Runtime
      dependencies are exactly `react` + `react-dom`. Dev tooling is
      `vite`, `@vitejs/plugin-react`, `typescript`, `oxlint`, and
      `@types/*` — no carousel, animation, gesture, or state-management
      library. Slide navigation, keyboard handling, swipe detection, and
      the boot-sequence timer are hand-rolled against native browser
      APIs (`src/hooks/`).
- [x] **Assets are organized logically.** `src/assets/boot/`,
      `src/assets/desktop/`, and `src/assets/cases/<itau|insense-onboarding|insense-ai>/`
      — one folder per case study, boot and desktop assets kept separate.
- [x] **Components are separated logically.** One folder per component
      under `src/components/` (component + colocated CSS Module + barrel
      export), with cross-cutting concerns split into `hooks/`, `data/`,
      and `config/` rather than living in the components themselves.
- [x] **There is no unnecessary global state library.** All state is
      `useState`/`useCallback` in `Portfolio.tsx`, matching the brief's
      conceptual state model — no Redux/Zustand/MobX/Context-as-global-store.
- [x] **The application does not depend on a backend.** Fully static
      SPA; `npm run build` output is deployable as static files with no
      server-side requirement (see README → Deployment).
- [ ] **The final implementation follows the supplied Figma design.**
      **Not verifiable from this environment** — the Figma link
      (`oSGVa81H3NHJO0hxS9WAbg`, node `6629-24192`) returns `403` to a
      direct fetch (Figma design links require an authenticated browser
      session), and no Figma Dev Mode/MCP tool is available here. The
      visual system was built from authentic Windows XP "Luna" theme
      conventions rather than exact Figma values — see README →
      "About the Figma design" for what that means concretely and how
      to close this out (exported design tokens, redlines, or
      screenshots would let me tighten `src/styles/theme.css` and the
      per-component CSS to match precisely).
