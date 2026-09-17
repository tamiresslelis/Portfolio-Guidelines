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

Sound plays on **every** black-screen boot→desktop transition (initial
load *and* every Start-button reboot alike) — not once per session.
`src/assets/audio/windows-xp-startup.wav` is the real Windows XP
startup chime, supplied by the project owner and trimmed (~4.95s) from
a source clip that had the startup and shutdown sounds back to back —
see `src/assets/audio/README.md`.

- [x] Sound does not loop — `audio.loop = false` (`useStartupSound.ts`).
- [x] Sound does not replay when opening/closing/switching cases, on
      slide navigation, or on any other re-render — the hook's effect
      is keyed on the specific `bootMode` transition from non-`null` to
      `null`, not on render.
- [x] Sound replays on every Start-button reboot, not just the initial
      load. The 1-second Start loading interaction remains unchanged
      (`START_BOOT_DURATION` in `src/config/timing.ts` untouched).
- [x] Autoplay rejection does not crash the application — `play()`'s
      promise is always caught; no console/page errors were observed.
- [x] Portfolio remains fully usable if audio playback is blocked — a
      blocked `play()` falls back to a one-time next-interaction retry
      and otherwise fails silently; nothing else in the UI depends on it.

**Bug found and fixed (first pass):** the original hook called
`sessionStorage`'s "played" flag immediately after *attempting*
`play()`, before knowing whether it succeeded. Since every browser
blocks unmuted autoplay before any page interaction, that first
attempt is rejected on nearly every real first visit — which meant the
session got marked "played" with nothing ever actually heard, and a
visitor reloading to try again found it permanently silent for the
rest of the session. Fixed at the time by moving the mark to the audio
element's native `playing` event and broadening the retry to five
event types. This `sessionStorage` gating was later removed entirely
(see next section) once "once per session" was superseded by "every
reboot."

**Second bug found and fixed — sound depended on an unrelated click:**
even after the above fix, the very first play of a session still
depended on the *initial* autoplay attempt being blocked and then
retried on whatever the visitor happened to click next (a folder, the
Start button, anywhere) — meaning the desktop could sit fully visible,
silent, for an arbitrary stretch until an unrelated click landed. The
project owner rejected this as incorrect: the sound must play
automatically the instant the desktop appears, with certainty, no
click-driven fallback. Since no browser will lift that restriction
before *any* page interaction has happened, the only valid fix was to
stop starting the initial boot's countdown until that interaction
happens, rather than let the countdown run unconditionally and hope
the resulting autoplay attempt is not blocked.

`useBootSequence` (`src/hooks/useBootSequence.ts`) now holds the
*initial* boot's 2s timer from starting until the visitor's first
`pointerdown`/`keydown`/`touchend` anywhere on the page; `XPBootScreen`
shows a "Click or Tap to START" prompt in place of the progress bar's
animation for as long as that's pending. Because the qualifying
gesture happens *before* `bootMode` ever clears for the first time,
`useStartupSound`'s `play()` call on that transition is no longer a
"maybe blocked, retry later" gamble — the browser's autoplay
requirement is already satisfied by the time it runs. The Start-button
reboot was never affected by this problem (it's only reachable after
the visitor has already interacted with the page once) and needed no
change.

Re-verified with real (non-instrumented, real Chromium autoplay
policy) Playwright runs, desktop and iPhone 13 emulation:

- [x] With zero interaction, the boot screen (and its "Click or Tap to
      START" prompt) stays up indefinitely — confirmed for 2.5s, well
      past the normal 2s boot duration, with the overlay's
      `aria-hidden` still `"false"`.
- [x] The first click/tap anywhere starts the countdown; the boot
      overlay clears ~2s later (`aria-hidden` flips to `"true"`).
- [x] `HTMLMediaElement.prototype.play` (intercepted to confirm a real
      call without altering autoplay behavior) fires exactly once, at
      the same moment the overlay clears — not before, not deferred to
      a later click.
- [x] Start-button reboot: the click prompt never reappears (its
      opacity stays `0`, since `awaitingFirstInteraction` is `false`
      once `bootMode !== "initial"`), the ~1s reboot completes, and
      `play()` fires exactly once automatically, again with no further
      click needed.
- [x] No console/page errors on either run.
- [x] `npx tsc --noEmit`, `oxlint`, and `npm run build` (client + SSR +
      prerender) all pass with the change in place.

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

## Resume password gate

`ResumePasswordDialog` now actually validates a password
(`src/components/ResumePasswordDialog.tsx`) instead of both buttons
just closing the dialog. Verified with a real Playwright run:

- [x] Opening the Resume folder shows the password dialog, not the
      resume, on a fresh visit.
- [x] An incorrect password shows an inline "Incorrect password.
      Please try again." message, clears the field, and refocuses it —
      the dialog stays open, nothing else changes.
- [x] The correct password reveals the real `ResumeWindow` (confirmed
      by the resume owner's name being visible) in place of the
      dialog.
- [x] Once unlocked, closing and reopening the Resume folder goes
      straight to the resume — the password prompt doesn't reappear
      for the rest of that visit.
- [x] No console/page errors through the whole flow.
- [x] `npx tsc --noEmit`, `oxlint`, and `npm run build` all pass with
      the change in place.

## Boot screen redesign

`XPBootScreen.tsx` was redesigned to match a reference boot-screen
screenshot the project owner shared: the flag mark stacked above a
centered "Microsoft® / Windows xp / Professional" wordmark (rather
than the flag positioned beside the text), and a wider, fully rounded
pill-shaped loading bar. The "Click or Tap to Start" prompt (see
"Startup sound" above for why it exists) was also made more
prominent and intuitive: a small cursor/tap icon, bold uppercase
letter-spaced text, a slow pulsing opacity animation
(`motion-reduce`-aware, `xp-pulse` in `src/styles.css`), and a
pointer cursor on the whole overlay while it's showing.

- [x] Visually matches the reference layout (flag on top, stacked
      wordmark below, pill progress bar) — confirmed via screenshot
      comparison.
- [x] The pulsing prompt only animates while `awaitingFirstInteraction`
      is true; it's fully hidden (`opacity-0`, no animation) once the
      countdown is running, on both the initial boot and the
      Start-button reboot.
- [x] The interaction-gating behavior itself (see "Startup sound"
      above) is unchanged by the redesign — reverified with a fresh
      Playwright run: boot overlay stays up indefinitely with no
      interaction, `play()` still fires exactly once at the moment the
      overlay clears after the first click.
- [x] `npx tsc --noEmit`, `oxlint`, and `npm run build` all pass with
      the change in place.

## Wallpaper quality upgrade

Replaced the 1200×965/111KB wallpaper with a higher-resolution source
the project owner supplied (a wallpaperswide.com reupload of the same
"Bliss" photo), split into a desktop and a mobile variant with a CSS
media-query swap (`.xp-wallpaper` in `src/styles.css`) instead of one
file for every screen size.

- [x] The source file's "WALLPAPERSWIDE.COM" watermark (baked into the
      bottom-right corner of the pixels, not a removable overlay) is
      fully gone from both shipped files — confirmed by cropping and
      visually inspecting that exact corner of each output.
- [x] Desktop variant: 1920×1030, ~143KB WebP — a real resolution
      upgrade over the old 1200×965 file while still small enough not
      to add meaningfully to page weight (smaller than several
      case-study slide images already shipped in this repo).
- [x] Mobile variant: 960×515, ~42KB WebP.
- [x] Verified with a real Playwright run at two viewports that the
      browser requests **only** the matching file, never both — a
      1280px-wide page loads `wallpaper-*.webp` and never touches
      `wallpaper-mobile-*.webp`, and a 390px-wide page does the
      reverse. Confirms this is an actual bandwidth saving on mobile,
      not just a visual swap of an already-downloaded image.
- [x] `background-size: cover` still handles cropping within whichever
      file loads — unchanged from before, so no visual distortion at
      any viewport.
- [x] The raw, watermarked source files supplied for processing were
      not committed to the repo — only the final cropped/resized/
      re-encoded outputs.
- [x] `npx tsc --noEmit`, `oxlint`, and `npm run build` all pass with
      the change in place.

## Case-study PDF rendering (JPG slides → react-pdf)

Root cause: each slide was a JPEG exported from the source deck at one
fixed resolution, which looked visibly soft on a maximized window or
any high-DPI display — an image asset has no more detail than it was
exported with, regardless of how large or sharp a screen displays it.
Replaced the whole JPG pipeline with `react-pdf`/`pdfjs-dist` rendering
the real PDFs directly, so every slide renders at whatever resolution
its actual viewing size and pixel density call for. See
[README → Case-study rendering](README.md#case-study-rendering-pdf-not-jpg)
for the full architecture.

- [x] No JPG-conversion step anywhere in the pipeline — the four case
      PDFs in `public/cases/` are the sole source of slide content;
      all 27 previous per-slide JPGs were deleted.
- [x] High-DPI/Retina rendering verified empirically at DPR 1, 2, and
      3 (via `page.evaluate` reading `devicePixelRatio` and forcing it
      in a headless run): canvas backing-store size is exactly
      `min(dpr, 2) × CSS size` in all three cases, confirming both the
      cap and that `width`/`devicePixelRatio` aren't double-applied.
- [x] Responsive sizing uses a `ResizeObserver`
      (`useResponsivePdfWidth`), not `window.innerWidth`. Verified with
      zero horizontal overflow and a correctly-scaled canvas at 375,
      390, 430, 768, 1024, 1280, 1440, and 1920px, all against the
      production build.
- [x] Efficient rendering: exactly one `<Page>` (one canvas) is ever
      mounted at a time — confirmed there is no scenario in the code
      that renders more than the current slide's page.
- [x] Neighboring pages are prefetched (`usePdfPagePrefetch`, via
      PDF.js's own cached `pdf.getPage()`) without rendering their
      canvases, so Prev/Next has no perceptible delay once the
      document itself has loaded.
- [x] Loading state reserves the exact pixel space the loaded page will
      occupy — verified with a route-level artificial delay on the PDF
      request: the placeholder's box and the final canvas's box match
      to within rounding (806×453.375 vs 806×453), i.e. no layout
      shift.
- [x] Error state (blocked/failed PDF request) shows a clear message,
      a working Retry button (remounts `<Document>`, successfully
      recovers once the block is lifted), and an "Open PDF" link with
      a correct `href` — all verified against a real aborted request.
- [x] The PDF is lazy-loaded: `CaseWindow.tsx` imports
      `CaseStudyViewer` via `React.lazy()`, so `react-pdf`/`pdfjs-dist`
      are absent from the main bundle and only fetched once a case
      folder is opened — confirmed in the actual `npm run build`
      output as a separate `CaseStudyViewer-*.js` chunk.
- [x] This lazy-loading also fixes a real SSR crash: a static import of
      `react-pdf` executed during the prerender pass, where Node lacks
      a JS feature (`Iterator`) `pdfjs-dist` 6.x requires. Verified
      fixed with a fresh Playwright console-error check (zero errors).
- [x] PDF.js worker configured correctly for both dev and the
      production build: `pdfjs.GlobalWorkerOptions.workerSrc` is set
      via `new URL("pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url)` in the same module that renders
      `<Document>`/`<Page>`. Verified in the production build by
      watching network responses: the hashed worker asset
      (`pdf.worker.min-*.mjs`) is requested and returns `200`, with
      zero console/page errors.
- [x] Accessibility: each rendered page is wrapped in a `<figure
      role="img" aria-label={alt}>` carrying the same hand-written
      `alt` text the JPG slides used; `←`/`→` keyboard navigation and
      the existing pagination dots/slide counter are unchanged and
      re-verified working against the PDF-based viewer.
- [x] Text/annotation layers evaluated, not assumed: briefly enabled
      both (`renderTextLayer`/`renderAnnotationLayer={true}`) against
      the real PDFs and found the extracted text layer was garbled
      (control characters interleaved with real words — subset-encoded
      fonts with no usable ToUnicode map) and vertically misaligned
      with the canvas on every span. Left disabled based on that actual
      finding, not a default assumption — see the code comment in
      `PdfPage.tsx` for the exact evidence.
- [x] `react-pdf`'s `suspense` prop (defaults to `true` on both
      `<Document>` and `<Page>`) was found, via extended DOM-polling
      against an artificially delayed request, to bubble the loading
      state up to the ancestor `<Suspense>` boundary from the point
      above instead of rendering the intended in-place
      placeholder/error UI. Fixed with `suspense={false}` on both
      components; reverified afterward that the correctly-sized,
      in-place placeholder — not the generic outer fallback — is what
      actually shows.
- [x] No layout-shift bug from a related React pitfall: `aspectRatio`
      as a plain numeric inline style is silently invalid CSS (React
      appends `px` to numbers it doesn't recognize as unitless).
      `PdfPlaceholder`/`PdfErrorState` compute an explicit pixel height
      instead — verified via `getComputedStyle` before and after.
- [x] Vertical scroll works when a page is taller than the viewport
      (short/wide windows): fixed a flexbox "unreachable overflow" bug
      by using `items-start` (not `items-center`) on the axis that can
      overflow, while keeping `justify-center` on the axis that can't.
- [x] Clean TypeScript throughout the new `case-study/` components and
      hooks: no `any`, explicit prop types, no unnecessary hooks or
      premature memoization.
- [x] `npx tsc --noEmit`, `oxlint`, and `npm run build` all pass with
      the change in place; the full verification suite above was
      re-run against the actual production build
      (`npm run build` + `vite preview`), not just `npm run dev`.

## Resizable case window + page-transition loading

Added mouse resizing to the case window (all 4 edges + 4 corners) and a
translucent loading overlay for slow Next/Prev transitions, without
redesigning the XP chrome. See
[README → Resizable case window](README.md#resizable-case-window) and
[README → Page-transition loading](README.md#page-transition-loading)
for the architecture.

- [x] All 4 edges and all 4 corners resize the window — verified with
      real pointer drags at each of the 8 handles, checking the exact
      resulting width/height/position delta after each one.
- [x] Correct resize cursor per handle (`ew-resize`/`ns-resize`/
      `nwse-resize`/`nesw-resize`), confirmed via `getComputedStyle`.
- [x] Minimum size (600×450) enforced — verified by dragging the right
      edge far enough left to try to go below it; width stopped at
      exactly 600.
- [x] Maximum size (viewport, minus the 34px taskbar on height)
      enforced — verified by dragging past the visible viewport in both
      directions; the window's edge stopped exactly at the viewport
      boundary instead of extending past it, and re-clamps on the
      browser's own `resize` event too.
- [x] The PDF automatically re-renders at the new width via the
      existing `ResizeObserver`-driven `useResponsivePdfWidth` — no
      window-specific PDF code was needed. Verified the canvas stays
      sharp and at the correct 16:9 aspect ratio after a resize
      (measured aspect ratio ~1.780 vs. the true 1.778).
- [x] Resizing doesn't hammer react-pdf: `useResponsivePdfWidth` now
      debounces every width change after the first by 80ms, so a fast
      pointer drag doesn't trigger dozens of re-rasterizations —
      confirmed the window itself still tracks the pointer at full
      frame rate (via `requestAnimationFrame`) independent of that
      debounce.
- [x] Resize handles use Pointer Events + `setPointerCapture` (no
      `window`-level listeners, nothing to leak) — a handle keeps
      receiving move/up events even once the cursor leaves its few
      -pixel-wide hit area.
- [x] A real correctness bug was found and fixed during verification:
      the content area's `position: relative` (for its own absolutely
      -positioned nav arrows) made it paint *over* the resize handles
      on 3 of 4 edges, despite the handles coming first in the DOM —
      CSS stacking order between positioned siblings doesn't follow DOM
      order the way it does against `position: static` content. Fixed
      by giving the handles the same `z-10` level `SlideNavigation`'s
      arrows already use, and bumping the title-bar buttons and
      pagination dots to the same level so they keep winning the tie
      (they come later in the DOM) wherever a handle's hit zone happens
      to overlap them.
- [x] Double-clicking the title bar maximizes; double-clicking again
      restores to the exact previous custom size (verified: a window
      resized to 920×640, then maximized and restored, came back to
      920×640 exactly) — the existing Maximize button is unchanged.
- [x] Mobile (≤600px) never renders resize handles — verified a
      390px-wide viewport shows zero handle elements and the window
      still fills the viewport via the pre-existing responsive layout,
      unchanged from before this feature.
- [x] A translucent "Loading next slide…" / "Loading previous slide…"
      overlay (with a spinner) appears over the *still-visible* old
      page — not a blank white flash — whenever a page takes long
      enough to render to notice. Verified under artificial CPU
      throttling: the previous page's canvas plus a second, hidden
      canvas for the incoming page are both mounted during the
      transition, and the overlay text matches the actual navigation
      direction ("next" when moving forward, "previous" when moving
      backward).
- [x] The loading state is wired to react-pdf's real
      `onRenderSuccess`/`onRenderError` callbacks, not a fixed
      `setTimeout` — confirmed the overlay disappears at the exact
      moment the background page finishes rendering, whether that's
      near-instant (a prefetched neighbor) or artificially slow (CPU
      -throttled, jumping to a distant, non-prefetched page).
- [x] Rapid navigation can't create a race: Next/Prev/pagination are
      disabled (verified via `aria-disabled`/native `disabled`) for the
      whole duration of a page render, and a background render's
      completion is checked against what its slot is *currently*
      targeting before being accepted — a stale completion for a page
      the visitor already navigated away from is ignored. Verified with
      real (non-forced) rapid clicks under heavy CPU throttling: exactly
      one canvas remains mounted once everything settles, with no
      console errors.
- [x] Exactly one canvas is mounted while idle; a second, hidden one
      only exists for the duration of an actual transition — verified
      directly via `document.querySelectorAll`, including a regression
      found and fixed where both slots re-rendering unconditionally on
      mount caused a spurious no-op "promotion" the moment the page
      first opened.
- [x] Accessibility: the loading message is a `role="status"
      aria-live="polite"` element; Next/Prev keep their existing
      `aria-label`s regardless of disabled state; `←`/`→` keyboard
      navigation continues to work (and is itself gated by the same
      rendering-in-progress check).
- [x] No new magic numbers: window sizing/breakpoint constants live in
      `src/config/window.ts`, matching the existing `src/config/
      timing.ts` pattern.
- [x] `npx tsc --noEmit`, `oxlint`, and `npm run build` all pass with
      the change in place; the full verification suite above (all 8
      resize directions, min/max clamping, all 8 required breakpoints,
      DPR 1/2/3 cap, mobile handle absence, double-click maximize/
      restore, loading overlay + direction copy, disabled-button
      race-condition check) was re-run against the actual production
      build (`npm run build` + `vite preview`), with zero console/page
      errors throughout.
