# Acceptance Criteria

Status as of the current commit on `main`. Checked items were verified
directly (build output, `tsc`, file inspection, or a rendered/screenshotted
run of the app); the one open item is called out explicitly rather than
checked off without evidence.

## Project setup

- [x] **Project was created from scratch.** No pre-existing app code —
      started from an empty repo (`README.md` only) and scaffolded fresh.
- [x] **Project uses React.** `react` + `react-dom` (`package.json`).
- [x] **Project uses TypeScript.** All source is `.ts`/`.tsx`;
      `npm run build` runs `tsc --noEmit` before bundling, so a type
      error fails the build.
- [x] **Project uses TanStack Start.** `@tanstack/react-start` +
      `@tanstack/react-router` + file-based routing (`src/routes/`).
      *(Superseded requirement: the project originally required plain
      Vite with no meta-framework — see "Stack migration" below for why
      that changed.)* TanStack Start is itself built on Vite
      (`vite.config.ts` + `@tanstack/react-start/plugin/vite`), so dev/
      build/preview still run through Vite under the hood.
- [x] **Project uses Tailwind CSS.** `tailwindcss` + `@tailwindcss/vite`;
      `src/styles.css` declares the Windows XP design tokens via a
      Tailwind v4 `@theme` block. *(Also a superseded requirement: the
      project originally used CSS Modules.)*
- [x] **`npm install` works.** Verified clean install. `@tanstack/react-start`
      declares `engines.node: ">=22.12.0"`; this environment has Node
      20.20, which produces an `EBADENGINE` warning but did not prevent
      install, dev, build, or preview from working here — that's not a
      guarantee it will everywhere, see README → Getting started.
- [x] **`npm run dev` starts the application.** Verified the dev server
      boots and serves real SSR content (confirmed with an HTTP request
      and a headless-browser run against it).
- [x] **`npm run build` completes without errors.** Verified — produces
      both a client and a server bundle in `dist/`.
- [x] **`npm run preview` serves the production build correctly.**
      Verified — full click-through flow (boot → desktop → open a case →
      navigate → maximize → close → Start reboot) re-run against the
      `vite preview` server with zero console/page errors.
- [x] **There are no TypeScript errors.** See `npm run build` above.
- [x] **There are no unnecessary large dependencies.** Runtime
      dependencies are `react`, `react-dom`, `@tanstack/react-router`,
      `@tanstack/react-start`, and `tailwindcss`/`@tailwindcss/vite` —
      all explicitly requested for this rebuild. No carousel, animation,
      gesture, or state-management library. Slide navigation, keyboard
      handling, swipe detection, and the boot-sequence timer are still
      hand-rolled against native browser APIs (`src/hooks/`), unchanged
      by the stack migration.
- [x] **Assets are organized logically.** `src/assets/boot/`,
      `src/assets/desktop/`, `src/assets/audio/`, and
      `src/assets/cases/<itau|insense-onboarding|insense-ai>/` — one
      folder per case study, boot/desktop/audio assets kept separate.
- [x] **Components are separated logically.** One flat file per
      component under `src/components/` (`Desktop.tsx`,
      `DesktopFolder.tsx`, `Taskbar.tsx`, `StartButton.tsx`,
      `CaseWindow.tsx`, `CaseSlide.tsx`, `SlideNavigation.tsx`,
      `SlideCounter.tsx`, `NavigationTooltip.tsx`, `XPBootScreen.tsx`),
      with cross-cutting concerns split into `hooks/`, `data/`, and
      `config/` rather than living in the components themselves. No more
      per-component CSS Modules subfolder now that styling is Tailwind
      utilities plus one shared `styles.css`.
- [x] **There is no unnecessary global state library.** All state is
      `useState`/`useCallback` in `routes/index.tsx`, matching the
      brief's conceptual state model — no Redux/Zustand/MobX/
      Context-as-global-store.
- [x] **The application does not depend on a backend.** No database, API,
      or auth, and as of the GitHub Pages deployment work, no server at
      runtime either — `prerender: { enabled: true }` (`vite.config.ts`)
      renders the one route to static HTML at build time, so
      `dist/client/` is a fully static site (`dist/server/` is a
      build-time-only implementation detail, never deployed). See README
      → "Deployment (GitHub Pages)".
- [ ] **The final implementation follows the supplied Figma design.**
      **Not verifiable from this environment** — the Figma link
      (`oSGVa81H3NHJO0hxS9WAbg`, node `6629-24192`) returns `403` to a
      direct fetch (Figma design links require an authenticated browser
      session), and no Figma Dev Mode/MCP tool is available here. The
      visual system was built from authentic Windows XP "Luna" theme
      conventions (plus reference screenshots the project owner shared
      directly) rather than exact Figma values — see README → "About
      the Figma design" for what that means concretely and how to close
      this out (exported design tokens, redlines, or screenshots would
      let me tighten the `@theme` block in `src/styles.css` to match
      precisely).

## Startup sound

Verified with an instrumented headless-browser run: `HTMLMediaElement.play`
was intercepted to count/record every call without depending on the real
browser's autoplay policy, then driven through the full initial-load,
Start-button, and case-open/navigate/close/reload flows.

- [x] Initial Windows XP loading screen still lasts ~2 seconds.
- [x] Desktop with the 3 folders appears after the loading screen.
- [x] Startup sound begins only after the initial desktop appears — 0
      `play()` calls while the boot screen was still visible, 1 right
      after it cleared.
- [x] Sound plays only once — `play()` call count stayed at 1 through
      every subsequent interaction in the run below.
- [x] Sound does not loop — `audio.loop = false` (`useStartupSound.ts`).
- [x] Sound does not replay when opening a case.
- [x] Sound does not replay when closing a case (Escape).
- [x] Sound does not replay when navigating slides (prev/next).
- [x] Sound does not replay after clicking Start.
- [x] The 1-second Start loading interaction remains unchanged
      (`START_BOOT_DURATION` in `src/config/timing.ts` untouched).
- [x] Sound does not replay when returning to the desktop.
- [x] React re-renders do not cause the sound to replay — the hook's
      effect is keyed on the specific `bootMode` transition, not on
      render.
- [x] Autoplay rejection does not crash the application — `play()`'s
      promise is always caught; no console/page errors were observed.
- [x] Audio state is remembered for the browser session, **once it has
      actually played** — see the bug-fix note below for the distinction.
- [x] Portfolio remains fully usable if audio playback is blocked — a
      blocked `play()` falls back to a one-time first-interaction retry
      and otherwise fails silently; nothing else in the UI depends on it.

**Update:** `src/assets/audio/windows-xp-startup.wav` is now the real
Windows XP startup chime, supplied by the project owner and trimmed
(~4.95s) from a source clip that had the startup and shutdown sounds
back to back — see `src/assets/audio/README.md`.

**Bug found and fixed:** the original hook called `sessionStorage`'s
"played" flag immediately after *attempting* `play()`, before knowing
whether it succeeded. Since every browser blocks unmuted autoplay
before any page interaction, that first attempt is rejected on nearly
every real first visit — which meant the session got marked "played"
with nothing ever actually heard, and a visitor reloading to try again
found it permanently silent for the rest of the session. This is what
was actually being reported as "the music doesn't work."

Fixed by moving the mark to the audio element's native `playing` event
— the one signal that means sound is genuinely coming out of the
speakers — and broadening the first-interaction retry to five event
types (`pointerdown`, `pointerup`, `touchend`, `mousedown`, `keydown`)
using plain `addEventListener`/`removeEventListener` instead of
`AbortSignal`, since browsers and input methods differ on which
gesture types they treat as sufficient to unlock playback. Re-verified
with real (non-instrumented) autoplay policy across a 4-reload
sequence in the same browser context:

| Reload | Visitor interacted? | `play()` attempted? | `playing` fired? | session flag after |
|---|---|---|---|---|
| 1 | no | yes (1, blocked) | no | not set |
| 2 | no | yes (1, blocked again) | no | not set |
| 3 | yes (clicked a folder) | yes (blocked, then 1 retry) | **yes** | **set** |
| 4 | — | **no attempt at all** | — | still set |

That table is the fix: reloads 1–2 keep trying (correctly — nothing
was ever heard, so nothing should be "used up"), reload 3 is where it
actually plays and only then gets marked, and reload 4 correctly does
nothing further. No console/page errors across the whole run.

## Stack migration (Vite SPA + CSS Modules → TanStack Start + Tailwind)

The project was rebuilt in place on a different stack at the project
owner's explicit direction, keeping all existing behavior (boot
sequence, startup sound, real case content for all three cases, slide
navigation, maximize, accessibility) rather than starting the feature
set over. Verified with real (non-instrumented) browser runs against
both `npm run dev` and `npm run preview` (the production build):

- [x] Boot screen still lasts ~2 seconds, no console/page errors during
      or after the transition to the desktop.
- [x] Desktop wallpaper covers the full viewport at 1024px, 1280px, and
      390px-wide (mobile) viewports, no empty space at any of them.
- [x] The 3 folders render with the exact reference label text ("Case
      Itaú: Foreign Currency Transactions", "Case Insense: Onboarding",
      "Case Insense: AI-Assisted Content Review") and wrap onto multiple
      lines without breaking mid-word.
- [x] Folder interaction matches the authentic model: a single click
      only selects (confirmed — 0 dialogs present after a single click),
      a double-click opens the case (confirmed — 1 dialog present after),
      and Enter/Space still open it in one step for keyboard users.
- [x] Opening a case, navigating slides, maximizing/restoring the
      window, closing with Escape, and the Start button's 1-second
      reboot back to a clean desktop all work with zero regressions
      from the pre-migration version.
- [x] Taskbar shows the green Start button (flag + "start", extracted
      into its own `StartButton` component per the brief) on the left
      and "Product Design Portfolio" right-aligned on the right, per the
      reference screenshot.
- [x] Mobile viewport (390px): folders lay out in a horizontal row,
      taskbar stays visible and fully functional, case window fills the
      screen — the XP desktop metaphor is preserved rather than falling
      back to a modern mobile card layout.

**Bug found and fixed:** the desktop wallpaper initially rendered as a
flat fallback color with no image at all. Root cause: Vite's default
asset handling inlines small SVGs as `data:image/svg+xml,...` URIs, and
a `background-image` set to a `data:` URI silently failed to apply in
testing — confirmed by isolating it down to a freshly-created,
class-less `<div>` with `element.style.backgroundImage` set directly:
even that computed to `none`, while the exact same assignment with a
normal same-origin file URL worked immediately. Fixed by setting
`build.assetsInlineLimit: 0` in `vite.config.ts`, so every asset
(wallpaper included) always resolves to a real, independently-cacheable
file URL instead of a data URI — verified in both `npm run dev` and the
production `npm run build` output (`wallpaper-*.svg` appears as its own
hashed file, not inlined).

## GitHub Pages deployment

- [x] Inspected the project before changing anything: `package.json`,
      `vite.config.ts`, `tsr.config.json`, the routes, and the build
      output confirmed TanStack Start was building an SSR server bundle
      (`dist/server/server.js`, a generic fetch-handler with no runtime
      listener) that GitHub Pages can't run, and `dist/client/` had no
      HTML at all (rendered per-request by that server) — grep across
      `src/` confirmed zero server functions, loaders, or API routes, so
      nothing about the app actually needs a server.
- [x] Configured static output: `prerender: { enabled: true }` on the
      `tanstackStart()` Vite plugin renders the one route to a real
      `dist/client/index.html` at build time. Verified this produces
      complete markup (the actual wallpaper/folders/taskbar DOM, ~9.5KB),
      not an empty placeholder — an earlier attempt using TanStack
      Start's `spa: { enabled: true }` option instead produced an
      almost-empty shell (`_shell.html`) that caused a React hydration
      mismatch (error #418) in the browser console on load; switching to
      plain `prerender` fixed that entirely (confirmed via a real
      browser run: zero console errors, vs. one before).
- [x] Base path is computed from `GITHUB_REPOSITORY` (set automatically
      by every GitHub Actions run) in `vite.config.ts` — no repository
      name hardcoded anywhere. Verified by building with
      `GITHUB_REPOSITORY=tamiresslelis/Portfolio-Guidelines npm run
      build`, then serving `dist/client/` from a local static server
      under a matching `/Portfolio-Guidelines/` subfolder (replicating
      GitHub Pages' project-site URL shape) and loading it with a real
      browser: every asset (`styles-*.css`, `index-*.js`, the wallpaper,
      case slides, the resume PDF, favicon.svg) resolved with the
      correct prefix, zero failed/4xx/5xx requests, all 5 desktop
      folders present, and opening a case worked normally.
- [x] `src/router.tsx` and `src/routes/__root.tsx`'s favicon link both
      pick up the same base path automatically via Vite's built-in
      `import.meta.env.BASE_URL`, rather than duplicating the computed
      value — verified both the default (`/`, local dev) and
      `/Portfolio-Guidelines/` (simulated CI) cases render correctly.
- [x] `scripts/postbuild-gh-pages.mjs` (run as part of `npm run build`)
      copies `index.html` to `404.html` — GitHub Pages' fallback for any
      unmatched path — and writes an empty `.nojekyll` so GitHub Pages
      doesn't run Jekyll over the output (which would ignore `_`-prefixed
      paths by convention). Verified the two files are byte-identical
      after build.
- [x] `npm ci && npm run build` verified clean from a fresh
      `node_modules` (matching what the CI workflow does), plus
      `tsc --noEmit` and `oxlint` both pass with zero errors/warnings on
      the final state.
- [x] `.github/workflows/deploy.yml` triggers on push to `main` and
      `workflow_dispatch`, has exactly the permissions GitHub's official
      Pages deployment needs (`contents: read`, `pages: write`,
      `id-token: write`), uses `actions/checkout`, `actions/setup-node`
      (`node-version: lts/*`, satisfying `@tanstack/react-start`'s
      `>=22.12.0` requirement), `npm ci`, `npm run build`,
      `actions/configure-pages`, `actions/upload-pages-artifact` (path:
      `dist/client`), and `actions/deploy-pages` — no `gh-pages` npm
      package involved.
- [x] The diff for all of this is small and surgical: `package.json`
      (one script line), `vite.config.ts`, `src/router.tsx`,
      `src/routes/__root.tsx` (a link href), one new script, one new
      workflow file. No component, style, content, or behavior changed —
      confirmed by the browser run above showing the exact same UI as
      every prior screenshot in this document.
