# Tamires Lelis — Portfolio

A product design portfolio presented as a Windows XP desktop: a boot
screen, a desktop with case-study "folders," and case studies that open
in XP-chrome windows with slide navigation.

Built with **React + TypeScript + TanStack Start + Tailwind CSS**, no
backend, no global state library — see [Architecture](#architecture) for
why. Deploys as a fully static site (see
[Deployment](#deployment--github-pages)) — nothing here needs a server at
runtime.

See [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) for the checklist
this build is held to, and its current status.

## Getting started

```bash
npm install
npm run dev       # starts the dev server (http://localhost:3000)
```

```bash
npm run build           # type-checks (tsc --noEmit) and builds client + server bundles into dist/
npm run preview         # serves the production build locally, to sanity-check it
npm run lint             # oxlint
npm run generate-routes  # regenerate src/routeTree.gen.ts by hand (normally automatic)
```

**Requires Node 22.12+.** `@tanstack/react-start` declares this as a hard
engine requirement; older Node versions may emit an `EBADENGINE` warning
on install and are not guaranteed to work in every environment (this
repo was developed and verified on Node 20.20, where it happened to run
fine, but don't rely on that — match the declared requirement for
anything beyond local experimentation, especially in CI or on a
deployment host).

## Deployment (GitHub Pages)

Every push to `main` builds and deploys automatically via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), using
GitHub's official `actions/*-pages` actions — no `gh-pages` npm package,
no manual `git push` to a `gh-pages` branch. You can also trigger a
deploy by hand from the Actions tab (`workflow_dispatch`).

**One-time setup, per repository:** Settings → Pages → Source →
**GitHub Actions**. That's the only manual step — everything else
(build, base path, artifact upload, deploy) is handled by the workflow.

This app has no server-only functionality (no loaders, no server
functions, no APIs) — everything is client-side React state — so it's
built as a fully static site rather than deployed as a live TanStack
Start server, which GitHub Pages can't run anyway (it only serves
static files):

- `vite.config.ts` sets `prerender: { enabled: true }` on the
  `tanstackStart()` plugin. This makes `vite build` render the app's one
  route (`/`) to a real `dist/client/index.html` at build time —
  actual markup, hydrated by the browser from there, not a live
  server rendering it per-request. `dist/server/` still gets built (the
  prerender step needs it internally to do that one-time render) but
  is never deployed — only `dist/client/` is.
- **Base path:** GitHub Pages serves a project site from
  `https://<user>.github.io/<repo-name>/`, not the domain root, so every
  asset and route URL needs that prefix. `vite.config.ts` reads
  `GITHUB_REPOSITORY` — a variable GitHub Actions sets automatically on
  every run — to compute `/<repo-name>/` with no repository name
  hardcoded anywhere and nothing to configure in the workflow. Locally,
  where that variable doesn't exist, it resolves to `/`, so
  `npm run dev`/`npm run build` behave exactly as before. The client
  router (`src/router.tsx`) picks up the same value automatically via
  Vite's built-in `import.meta.env.BASE_URL`.
- **Refreshing a route / deep links:** unlike a real server, GitHub
  Pages can't run app code to handle arbitrary paths, so a hard refresh
  on anything other than the exact deployed file would 404. The fix is
  the standard static-host trick: `scripts/postbuild-gh-pages.mjs` (run
  as part of `npm run build`) copies the built `index.html` to
  `404.html`. GitHub Pages serves `404.html` for any unmatched path, so
  the app still boots normally and the router takes it from there. The
  same script also drops a `.nojekyll` file, which stops GitHub Pages
  from running its default Jekyll processing over the build output —
  Jekyll ignores `_`-prefixed files/folders by convention, which could
  otherwise silently break a future build.

**Local sanity check:** `npm run preview` serves `dist/client/` at the
domain root (no subpath), which is enough to catch build errors but
won't reproduce GitHub Pages' `/repo-name/` prefix. To check that
specifically, build with `GITHUB_REPOSITORY=<user>/<repo> npm run build`
and serve `dist/client/` from a subfolder matching the repo name.

**If this repository has no Git remote yet:** create the GitHub
repository first (matching whatever name you used above, or update
accordingly), then:

```bash
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

The workflow runs automatically on that push once Pages' source is set
to GitHub Actions (see above).

## Project structure

```
src/
  assets/
    boot/                    # boot screen is CSS/SVG — see the README there
    desktop/                 # wallpaper, flag mark, folder icon (see below)
    audio/                   # the XP startup chime (see below)
    resume/                  # the original resume PDF (see below)

  components/
    Desktop.tsx              # wallpaper + folders + case/resume window + taskbar
    DesktopFolder.tsx        # one desktop icon
    Taskbar.tsx              # the taskbar shell
    StartButton.tsx          # the green Start button
    CaseWindow.tsx           # XP window chrome hosting a case study's PDF viewer
    case-study/
      CaseStudyViewer.tsx    # composition root: sizing, prefetch, current-page state
      PdfDocument.tsx        # <Document> wrapper: worker config, loading/error, retry
      PdfPage.tsx            # one rendered PDF page at DPR-capped resolution
      PdfPlaceholder.tsx     # fixed-size loading placeholder (no layout shift)
      PdfErrorState.tsx      # error UI + Retry / Open PDF
    SlideNavigation.tsx      # prev/next arrow buttons
    SlideCounter.tsx         # "n / total" readout
    NavigationTooltip.tsx    # first-time "use ← → or swipe" hint
    ResumeWindow.tsx         # XP window chrome hosting the resume document
    XPBootScreen.tsx         # full-viewport boot/loading screen

  config/
    timing.ts                # the two boot durations, centralized (see below)

  data/
    cases.ts                 # case-study content model + data (PDF url + per-slide alt text)
    resume.ts                # resume content model + data

  hooks/
    useBootSequence.ts        # owns the boot-screen timer
    useStartupSound.ts        # plays the XP chime on every boot->desktop transition
    useKeyboardNavigation.ts  # ← → to navigate slides, Esc to close
    useSwipeNavigation.ts     # touch swipe to navigate slides
    useResponsivePdfWidth.ts  # ResizeObserver-based width for the PDF viewer
    usePdfPagePrefetch.ts     # warms PDF.js's per-page cache for the neighbors of the current page

  routes/
    __root.tsx               # HTML shell, <head> tags, global stylesheet link
    index.tsx                # the page: owns all app state, renders Desktop + XPBootScreen

  router.tsx                  # TanStack Router instance
  routeTree.gen.ts             # generated — do not hand-edit
  styles.css                   # Tailwind entry + design tokens (@theme) + keyframes

public/
  cases/                      # the real case-study PDFs, served as static files (see below)

scripts/
  postbuild-gh-pages.mjs      # turns the build output into a GitHub Pages-ready static site

.github/workflows/
  deploy.yml                   # builds + deploys to GitHub Pages on every push to main
```

Components are flat files (no per-component CSS Modules folder anymore
— see [Architecture](#architecture)). `data/`, `config/`, and `hooks/`
are unchanged from before this stack migration: they're plain
TypeScript with no framework or styling dependency, so nothing about
the case-study content, boot timing, or the startup-sound logic needed
to change.

## Architecture

- **State** lives in `routes/index.tsx` as plain `useState`/`useCallback`
  (the route component itself, rather than a separate `Portfolio`
  wrapper — TanStack Router's file-based routing already gives `/` a
  dedicated component, so an extra wrapper would just be indirection).
  State covers `bootMode`, `activeCaseId`, `currentSlide`, `isResumeOpen`,
  and `hasSeenNavigationTooltip`. `isResumeOpen` is mutually exclusive
  with `activeCaseId` — opening one explicitly closes the other, so only
  one window is ever on screen, matching every existing "back to
  desktop" path (Start, close, boot). No Redux/Zustand/etc. — there's
  nothing here that outgrows React state.
- **The two boot durations** (`INITIAL_BOOT_DURATION = 2000`,
  `START_BOOT_DURATION = 1000`) are defined once in
  `src/config/timing.ts` and consumed through the `useBootSequence`
  hook, which owns the single `setTimeout` that clears `bootMode`. No
  duplicated, unexplained `setTimeout(..., 2000)` calls anywhere else.
- **Three distinct exit paths**, as specified:
  - Initial load → `XPBootScreen`, waiting for the visitor's first
    click/tap/keypress before its 2000ms countdown starts (see
    "Startup sound" below for why) → desktop (smooth opacity
    cross-fade, not a reload).
  - Start button → `activeCase`/`currentSlide` reset immediately,
    `XPBootScreen` for 1000ms → desktop.
  - Red X / <kbd>Escape</kbd> → case closes immediately, no boot screen.
- **Desktop folder interaction is authentic XP, not simplified:** a
  single click/tap selects an icon (translucent blue highlight);
  double-click opens it. <kbd>Enter</kbd>/<kbd>Space</kbd> open it in
  one step for keyboard users — requiring two key presses there would
  be an accessibility regression the mouse interaction doesn't have.
- **Keyboard & swipe navigation** are hand-rolled
  (`useKeyboardNavigation`, `useSwipeNavigation`) against native
  `keydown`/`touchstart`/`touchend` events — no carousel or gesture
  library.
- **Window controls:** the case window's minimize button is present for
  XP-chrome authenticity but styled as disabled — this window only
  supports closing (X / Escape). Maximize is real: `CaseWindow` keeps a
  local `isMaximized` boolean (reset to `false` whenever a different
  case is opened, so one window's maximize state never leaks into the
  next), and toggles between Tailwind classes that fill the desktop
  down to the taskbar and the normal centered floating window.
- **Tailwind CSS v4** for styling, with the Windows XP design tokens
  (colors, type scale, radii, shadows, animations) declared once in an
  `@theme` block in `src/styles.css` — that generates ordinary Tailwind
  utilities (`bg-xp-taskbar-start`, `text-xp-sm`, `rounded-xp-window`,
  `animate-xp-wave`, ...) rather than needing a parallel CSS-in-JS or
  CSS-Modules system. Multi-stop gradients still need one-off
  arbitrary-value utilities at their call sites (e.g.
  `bg-linear-to-b from-xp-titlebar-mid ... to-xp-titlebar-end`) — that's
  the "small custom CSS" a Tailwind-only approach can't fully avoid for
  XP-specific chrome, kept to individual `className` strings rather
  than a separate stylesheet per component.
- **TanStack Start** (file-based routing via TanStack Router, SSR by
  default) instead of a plain Vite SPA. The app has exactly one route
  (`/`) — routing itself isn't a real requirement here, but it's what
  was asked for; `routes/index.tsx` owns the same state
  `Portfolio.tsx` used to.

## Case-study rendering (PDF, not JPG)

Each case study is rendered directly from its real PDF deck via
[`react-pdf`](https://github.com/wojtekmaj/react-pdf) (a React wrapper
around Mozilla's `pdfjs-dist`) — there is no JPG-conversion step
anywhere in the pipeline. This replaced an earlier per-slide-JPEG
approach, whose fixed export resolution went visibly soft once a slide
was viewed on a maximized window or a high-DPI display; a PDF has no
fixed resolution; the same source renders sharp at whatever size and
pixel density it's asked to draw at.

- **`public/cases/*.pdf`** — one PDF per case (`itau.pdf`,
  `insense-onboarding.pdf`, `insense-ai.pdf`, `quick-win.pdf`), served
  as plain static files (Vite's `public/` passthrough), each page in
  reading order matching that case's `slides` array in
  `src/data/cases.ts`. They're pre-optimized with Ghostscript
  (`-dDownsampleColorImages=true -dColorImageResolution=150
  -dJPEGQ=75 -dDetectDuplicateImages=true`) to keep file size
  reasonable (1.2–4MB each) without softening the vector text/line art
  that carries most of each slide's legibility — only embedded raster
  backgrounds get recompressed.
- **Rendering pipeline**
  (`src/components/case-study/CaseStudyViewer.tsx` →
  `PdfDocument.tsx` → `PdfPage.tsx`): `CaseStudyViewer` measures its
  container with a `ResizeObserver` (`useResponsivePdfWidth`, capped at
  1600px — these PDFs' native page width) rather than
  `window.innerWidth`, since the actual available space can be
  narrower than the viewport (window padding, a non-maximized floating
  window). `PdfDocument` owns the PDF.js worker configuration and the
  `<Document>` element; `PdfPage` renders exactly one `<Page>` for the
  current slide.
- **High-DPI/Retina rendering:** `PdfPage` passes react-pdf's own
  `devicePixelRatio` prop, capped at `Math.min(window.devicePixelRatio
  || 1, 2)`. That prop independently multiplies the canvas's *backing
  store* resolution against the CSS size the `width` prop already
  establishes — passing an already-DPR-multiplied `width` instead would
  double-apply the multiplier and render the page far larger than
  intended. The cap exists because a 3×-DPR phone asking for a
  3×-resolution canvas buys no visible sharpness over 2× at normal
  viewing distance, for 2.25× the memory/GPU cost.
- **Lazy loading:** `CaseWindow.tsx` imports `CaseStudyViewer` via
  `React.lazy()` behind a `<Suspense>` boundary rather than a static
  top-level import. This does two things at once: it code-splits
  `react-pdf`/`pdfjs-dist` into their own chunk that only downloads once
  a case folder is actually opened (confirmed in the production build
  output as a separate `CaseStudyViewer-*.js` chunk, not part of the
  main bundle), and it keeps that browser-only library out of the SSR
  render entirely — a static import would have executed it during the
  prerender pass too, where it crashes (Node lacks a JS engine feature
  pdfjs-dist assumes exists).
- **Prefetching:** `usePdfPagePrefetch` calls PDF.js's own
  `pdf.getPage(n)` (which internally caches per page number) on the
  current slide's immediate neighbors — fetching and parsing their page
  data, but never rendering a canvas for them — so Prev/Next feels
  instant without ever mounting more than one canvas at a time.
- **Loading & error states:** `PdfDocument` and `PdfPage` both pass
  `suspense={false}` to react-pdf's `<Document>`/`<Page>` — react-pdf
  defaults that prop to `true`, which throws a promise instead of
  rendering the `loading`/`error` render props, bubbling up to whatever
  ancestor `<Suspense>` boundary catches it first (here, the
  code-splitting boundary from the point above) instead of showing
  these components' own, correctly-sized placeholders. `PdfPlaceholder`
  reserves the exact pixel space the loaded page will occupy (computed
  as `width / aspectRatio`, not the CSS `aspect-ratio` property — see
  the note below) so nothing shifts when the real page swaps in.
  `PdfErrorState` offers Retry (remounts `<Document>` via a token key)
  and an "Open PDF" link straight to the file.
- **Text/annotation layers are disabled** (`renderTextLayer={false}`,
  `renderAnnotationLayer={false}`) — verified, not assumed: enabling
  them against these PDFs produced garbled extracted text (control
  characters interleaved with real words, from subset-encoded fonts
  with no usable ToUnicode map) with every text span vertically
  misaligned from its counterpart on the canvas. Each slide's
  hand-written `alt` text is what assistive tech reads instead, via
  `role="img"` on the wrapping `<figure>`.
- **A React inline-style pitfall worth knowing if you touch
  `PdfPlaceholder`/`PdfErrorState`:** React appends `px` to bare
  numeric style values it doesn't recognize as unitless, and
  `aspectRatio` isn't on that (old, pre-dates-the-CSS-property) list —
  passing a number there is silently invalid CSS and does nothing. Both
  components compute an explicit pixel `height` instead.

**To add another case study:** export its deck as a single PDF, drop it
in `public/cases/<id>.pdf`, and add an entry to the `cases` array in
`src/data/cases.ts` (`id`, `folderLabel`, `title`, `summary`,
`pdfUrl: casePdfUrl("<id>.pdf")`, and one `{ alt, caption? }` per slide,
in the same order as the PDF's pages). `Desktop.tsx` and
`CaseStudyViewer` both key off that array with no per-case code
anywhere, so nothing else needs to change. If the new deck's page
proportions aren't 16:9, update `PDF_PAGE_ASPECT_RATIO` in
`CaseStudyViewer.tsx` (or turn it into a per-case field, if two decks
ever need different ratios at once) — otherwise the loading placeholder
briefly shows the wrong shape before the real page swaps in.

## Startup sound

The real XP startup chime (`src/assets/audio/windows-xp-startup.wav`,
~4.95s — see `src/assets/audio/README.md` for provenance) plays every
time the black boot/loading screen finishes and the desktop appears —
the initial load *and* every subsequent Start-button reboot alike, since
both are the same transition. It does not play for opening/closing/
switching cases, for slide navigation, or on any other render.

No modern browser allows unmuted audio to autoplay before the visitor
has interacted with the page at all — that's browser policy, not
something client-side code can override. Rather than let that block the
*first* play and fall back to a delayed retry (which meant a visible
desktop with no sound until a second, unrelated click happened to land),
the initial boot's own countdown is gated behind that first interaction:

- `useBootSequence` (`src/hooks/useBootSequence.ts`) only starts the
  "initial" boot's 2s timer once the visitor has clicked, tapped, or
  pressed a key anywhere on the page (`pointerdown` / `keydown` /
  `touchend`, once). Until then, `XPBootScreen` shows the boot screen
  indefinitely with a "Click or Tap to START" prompt in place of the
  progress bar's animation. The one gesture this asks for is what gets
  the visitor into the site at all — not an extra click after the
  desktop already showed up.
- Because that gesture satisfies the browser's autoplay requirement
  *before* `bootMode` ever transitions to `null` for the first time,
  `useStartupSound(bootMode)` (`src/hooks/useStartupSound.ts`) — which
  watches for any transition from a non-null `bootMode` to `null` —
  can call `play()` right then and have it succeed immediately, with
  certainty, every time. The Start-button reboot never needs the
  gate at all: by the time it's reachable, the visitor has already
  interacted with the page once (through this same gate), so the
  browser's autoplay policy is already unlocked for the rest of the
  session.
- A blocked-play fallback (retrying on the visitor's next
  `pointerdown` / `pointerup` / `touchend` / `mousedown` / `keydown`)
  still exists in `useStartupSound` as a safety net for any edge case
  the gate doesn't anticipate, but in normal use it never has to fire.
- One `Audio` element is created once and reused (rewound to the start
  each time) rather than a new one per play. Volume is fixed at `0.6`,
  `loop` is `false`, and every `play()` call is wrapped so a browser
  that doesn't return a Promise from `play()` (very old WebKit) can't
  throw an uncaught error — it's normalized into a real Promise either
  way.

**Rights note:** "The Microsoft Sound" is Microsoft's copyrighted
property. The audio file here was supplied by the project owner for
this personal, non-commercial portfolio; it wasn't sourced from the
internet by me. Keep that in mind if this repo or its deployment ever
goes fully public/commercial.

## About the Figma design

This environment doesn't have Figma Dev Mode / MCP access, and the
shared Figma link isn't reachable from here (`403`, since Figma design
links require an authenticated session in a browser). I could not pull
exact frame dimensions, spacing, or hex values from
`oSGVa81H3NHJO0hxS9WAbg`, node `6629-24192`.

Instead, the visual system (the `@theme` block in `src/styles.css`) is
built from well-documented, authentic Windows XP "Luna" theme metrics: a
34px taskbar, a green gradient start button, a blue-gradient title bar
with a red close button, Tahoma-first typography, etc., plus reference
screenshots the project owner shared directly of the real boot screen
and the "Bliss" desktop. Every token is declared once, so tightening
colors/spacing/sizes to match Figma exactly is a find-and-tune job in
that one `@theme` block plus the handful of arbitrary-value gradients —
the component structure and behavior won't need to change.

If you're able to share exported values (a `tokens.json`/style
dictionary export, or just the numbers) or screenshots, I can match
them precisely.

## Case-study assets

All four cases use their real decks, rendered directly from the source
PDFs (see [Case-study rendering](#case-study-rendering-pdf-not-jpg)
above) — there's no separate exported-image asset per slide anymore.
Each slide's `alt` text in `src/data/cases.ts` still describes what's on
it (headline, key stats, screenshots) for screen-reader users, since the
text lives inside the PDF page rather than as real DOM content.

- **Itaú** (`public/cases/itau.pdf`) — 10 slides: cover, business
  context, understanding the existing experience, userflow, usability
  test, usability data analysis, v1-vs-final, accessibility
  specifications, handoff, outcome.
- **Insense Onboarding** (`public/cases/insense-onboarding.pdf`) — 7
  slides: cover, business context, diagnosis, research signals,
  value-exchange clarity, v1-vs-final, outcome.
- **Insense AI** (`public/cases/insense-ai.pdf`) — 3 slides: cover,
  project overview, AI review flow.
- **Quick Win** (`public/cases/quick-win.pdf`, Ritchie Bros) — 7
  slides: cover, question, diagnosis, user perception, goal, usability
  issue, closing.

The desktop background is the real "Bliss" photo (see
`src/assets/desktop/README.md` for provenance and size/quality notes);
the rest of the desktop chrome is hand-drawn CSS/SVG rather than bitmap
screenshots, redrawn to match reference screenshots the project owner
shared of the real boot screen and desktop:

- `src/assets/desktop/wallpaper.webp` (1920×1030, ~143KB) /
  `wallpaper-mobile.webp` (960×515, ~42KB) — the real "Bliss"
  photograph, supplied by the project owner. A CSS media query swaps
  between the two by viewport width (see
  `src/assets/desktop/README.md`), so only one is ever downloaded.
- `src/assets/desktop/xp-flag.svg` — the four-color flag mark used in
  the boot screen and the taskbar's start button.
- `src/assets/desktop/folder-icon.svg` — a redrawn classic yellow folder.
- `src/assets/boot/` — no bitmap needed; the "Microsoft Windows xp
  Professional" boot screen (flag, wordmark, loading bar, copyright/logo
  footer) is built entirely in `XPBootScreen` with Tailwind utilities
  (see the README in that folder for how to swap in a real screenshot
  instead).

**To add or replace slides within an existing case:** replace the PDF
at `public/cases/<id>.pdf` and update the `slides` array in
`src/data/cases.ts` to match its new page order/count — see
[Case-study rendering](#case-study-rendering-pdf-not-jpg) above for the
full "add a case study" steps. The slide count per case isn't
hardcoded anywhere else, so adding/removing slides just means editing
that array and the PDF together.

**Note on asset inlining:** `vite.config.ts` sets
`build.assetsInlineLimit: 0`, so assets like these always resolve to
real, independently-cacheable file URLs instead of being inlined as
`data:` URIs. That matters specifically for the wallpaper: a CSS
`background-image` set to a `data:` URI can silently fail to render
under some browser security configurations, while a normal file URL
doesn't have that problem.

## Resume

The fourth desktop folder, "Resume," opens `ResumePasswordDialog` — a
small, non-resizable modal styled after the classic Windows XP network
credentials prompt ("Connect to &lt;server&gt;"): a short bio, a
"Password required to see full resume" field, and OK/Cancel. Cancel,
the red X, and Escape all dismiss it without unlocking anything.

Submitting the correct password (case-insensitive, whitespace-trimmed)
reveals the real full resume — `ResumeWindow.tsx` + `src/data/resume.ts`,
real semantic HTML content plus a "Download PDF" link to
`src/assets/resume/tamires-lelis-resume.pdf` — in place of the dialog.
A wrong password shows an inline "Incorrect password" message, clears
the field, and refocuses it instead of closing anything. This isn't
meaningful security (it's a static site, the check runs entirely in
the browser) — it's a lightweight, memorable gate in front of the full
resume, not a real credential.

Once unlocked, it stays unlocked for the rest of that visit
(`isResumeUnlocked` in `routes/index.tsx`) — reopening the Resume
folder goes straight to the resume instead of asking again. It only
resets on a full page reload.

Opening the resume (dialog or, once unlocked, the resume window itself)
and opening a case are mutually exclusive (see `isResumeOpen` in
[Architecture](#architecture)) — only one window is ever open at a
time, same as everywhere else in the app.

## Accessibility

- Folders and all controls are real `<button>`s with descriptive
  `aria-label`s; the case window is a labeled `role="dialog"` with
  focus moved in on open and restored to the triggering folder on
  close.
- <kbd>←</kbd>/<kbd>→</kbd> navigate slides, <kbd>Esc</kbd> closes the
  case window; the slide counter announces changes via
  `aria-live="polite"`.
- `prefers-reduced-motion: reduce` disables the boot screen's flag-wave
  and loading-bar animations via Tailwind's `motion-reduce:` variant.
- Focus is visible everywhere via a high-contrast `:focus-visible` ring
  that reads against both the blue desktop and the light window chrome.

## Responsive behavior

- Desktop icons run in a left-hand column above ~600px, and wrap into a
  horizontal row near the top on narrower screens.
- The case window is a centered, fixed-size floating window above
  ~600px, and expands to fill the viewport (minus the taskbar) below
  that, with larger (44px) touch targets for the prev/next controls.
- The taskbar collapses the "start" label to just its icon below 480px
  to leave room for the active-case button and the "Product Design
  Portfolio" label.
