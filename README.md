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
    XpTaskbarItem.tsx        # a small "pressed-in" taskbar button (case title, "Since 2011")
    XpTooltip.tsx            # hover/focus/tap XP-styled tooltip (pale yellow, square corners)
    XpSystemTray.tsx         # bottom-right notification area: flag + Florianópolis clock
    XpClock.tsx              # presentational flag + "HH:MM" readout
    CaseWindow.tsx           # XP window chrome hosting a case study's PDF viewer
    ResizeHandles.tsx        # the 8 invisible edge/corner drag zones for CaseWindow
    case-study/
      CaseStudyViewer.tsx    # composition root: sizing, prefetch, page-buffer, current-page state
      PdfDocument.tsx        # <Document> wrapper: worker config, loading/error, retry
      PdfPage.tsx            # one rendered PDF page at DPR-capped resolution
      PdfPlaceholder.tsx     # fixed-size loading placeholder (no layout shift)
      PdfErrorState.tsx      # error UI + Retry / Open PDF
      PageLoadingOverlay.tsx # translucent "Loading next/previous slide…" overlay
    SlideNavigation.tsx      # prev/next arrow buttons
    SlideCounter.tsx         # "n / total" readout
    NavigationTooltip.tsx    # first-time "use ← → or swipe" hint
    ResumeWindow.tsx         # XP window chrome hosting the resume document
    XPBootScreen.tsx         # full-viewport boot/loading screen

  config/
    timing.ts                # the two boot durations, centralized (see below)
    window.ts                # case window min/max sizing + the mobile/resize breakpoint

  data/
    cases.ts                 # case-study content model + data (PDF url + per-slide alt text)
    resume.ts                # resume content model + data

  hooks/
    useBootSequence.ts        # owns the boot-screen timer
    useStartupSound.ts        # plays the XP chime on every boot->desktop transition
    useKeyboardNavigation.ts  # ← → to navigate slides, Esc to close
    useSwipeNavigation.ts     # touch swipe to navigate slides
    useResponsivePdfWidth.ts  # ResizeObserver-based, debounced width for the PDF viewer
    usePdfPagePrefetch.ts     # warms PDF.js's per-page cache for the neighbors of the current page
    usePdfPageBuffer.ts       # two-slot double buffer behind the page-transition loading overlay
    useResizableWindow.ts     # pointer-driven edge/corner resizing for CaseWindow
    useClientClock.ts         # the live Florianópolis "HH:MM" behind XpSystemTray

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

## Resizable case window

On desktop (above `MOBILE_WINDOW_BREAKPOINT_PX` = 600px, see
`src/config/window.ts`), the case window can be resized by dragging any
of its four edges or four corners, in addition to the existing Maximize
button — double-clicking the title bar also toggles maximize/restore,
returning to whatever custom size was set before maximizing rather than
the default centered one.

- **`src/hooks/useResizableWindow.ts`** owns all of the drag mechanics:
  Pointer Events + `setPointerCapture` (not `window`-level mousemove/
  mouseup listeners) so a handle keeps receiving `pointermove`/
  `pointerup` even once the cursor leaves its few-pixel-wide hit area,
  with zero manual listener add/remove. Pointer-driven size updates are
  batched through `requestAnimationFrame` (one visual update per frame,
  not per pointermove event) and clamped to `MIN_CASE_WINDOW_WIDTH_PX`/
  `MIN_CASE_WINDOW_HEIGHT_PX` on the small end and the current
  viewport (minus the taskbar) on the large end — re-clamped on the
  browser's own `resize` event too, so a previously custom-sized window
  can never end up bigger than a shrunk browser window. All of this
  state is local to `CaseWindow` — dragging a handle only re-renders
  that window, not the rest of the app.
- **`src/components/ResizeHandles.tsx`** renders the eight drag zones:
  6px-thick edge strips and 14px corner squares, fully invisible (no
  background/border — only the cursor changes) to stay faithful to the
  XP chrome rather than adding modern-looking resize handles. They're
  positioned *inside* the window's own rounded/clipped box (not hanging
  outside it), and rely on `z-10` — the same stacking level
  `SlideNavigation`'s arrow buttons already use — placed earlier in the
  DOM than the window's real controls, so any real button, nav arrow, or
  pagination dot that happens to overlap a handle's hit zone still wins
  the click (CSS stacking, not DOM order, decides paint order between
  positioned elements — see the comment in that file for the full
  reasoning). Below the resulting ~600×450 minimum, dragging a handle
  further doesn't shrink the window past what the title bar, footer, and
  a legible PDF area need.
- **The PDF responds to a resize automatically**, through the same
  `ResizeObserver`-driven `useResponsivePdfWidth` described above — no
  special-case code was needed for resizing specifically. That hook now
  also debounces (80ms) every width change *after* the first one, so
  dragging a handle doesn't ask react-pdf to re-rasterize the page
  dozens of times per second; the window itself still tracks the
  pointer at a full frame rate, only the (comparatively expensive) PDF
  re-render is throttled.
- **Disabled entirely on mobile:** `useResizableWindow` watches its own
  `(max-width: 600px)` media query and reports `isResizingEnabled: false`
  below it, regardless of what `CaseWindow` asks for — `CaseWindow`
  skips rendering `<ResizeHandles>` and falls back to the existing
  full-viewport responsive layout in that case, exactly as before this
  feature existed.

## Page-transition loading

Clicking Next/Prev (or a pagination dot, or `←`/`→`) now shows a
translucent "Loading next slide…" / "Loading previous slide…" overlay,
with a spinner, whenever rendering the requested page takes long enough
to notice — the previous page stays visible underneath rather than
blanking to white.

- **The problem this solves:** react-pdf's `<Page>` re-fetches/
  re-renders whenever its `pageNumber` prop changes, and — regardless of
  whether that page's data is already cached — briefly shows its
  `loading` fallback in place of the *previous* page's canvas while it
  does. There's no supported way to make a single `<Page>` instance keep
  showing its old content while loading a new page number.
- **`src/hooks/usePdfPageBuffer.ts`** solves this with a small two-slot
  double buffer: two fixed "slots," each rendered as its own
  `<PdfPage>` by `CaseStudyViewer`. Only one slot is ever visible; a
  page-number change reassigns the *other* (currently hidden) slot and
  renders it off-screen, and only once it actually finishes rendering
  (a real `onRenderSuccess` callback, never a fixed `setTimeout`) does
  the hook flip which slot is "active." A slot's own `pageNumber` prop
  is only ever reassigned while it's hidden — never while it's the one
  on screen — which is what keeps the visible page from ever
  re-triggering react-pdf's own loading flash. The background slot only
  mounts while a transition is actually in flight, so idle viewing still
  costs exactly one canvas, matching the "never render every page at
  once" rule from the PDF rendering work above.
- **Rapid navigation is handled two ways at once:** Next/Prev/pagination
  are disabled (`isPageRendering`, bubbled up from `CaseStudyViewer` to
  `CaseWindow`) while a page is rendering, so a real click can't queue a
  second in-flight render; independently, the hidden slot's target is
  always whatever page was most recently requested, so even a
  keyboard-repeat or another out-of-band trigger simply retargets the
  same in-flight background render instead of starting a second one —
  and a completion callback for a page the visitor has since navigated
  away from is detected and ignored (checked against what the slot is
  *currently* assigned to, not what it was assigned to when the render
  started).
- **Accessibility:** the overlay's message is in a `role="status"
  aria-live="polite"` element, and the Next/Prev buttons keep their
  existing `aria-label`s regardless of their disabled state.

## Taskbar system tray

The taskbar's bottom-right corner (previously a plain "Product Design
Portfolio" label) is now an authentic-looking Windows XP notification
area: a Brazilian flag and the current time in Florianópolis, with two
quiet, explorable details rather than explanatory copy — a personal
touch, not decoration competing with the case studies.

- **`src/components/XpSystemTray.tsx`** renders the tray itself: a
  shade lighter/cooler than the main taskbar (`--color-xp-tray-start`/
  `-end` in `src/styles.css`), with an inset border matching real XP
  chrome. It owns the live clock value (`useClientClock`) and builds
  the accessible name (`aria-label="Florianópolis time, 19:42 (UTC−3)"`)
  from it — `XpClock` itself is purely presentational.
- **`src/hooks/useClientClock.ts`** formats the time via
  `Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit",
  hour12: false, timeZone: "America/Sao_Paulo" })`, refreshed every 15s
  (a "HH:MM" display only changes once a minute — no need to re-render
  every second). **Hydration-safe by construction:** it returns `null`
  until its first `useEffect` runs, which never happens during the
  server prerender — so the server's output and the client's very
  first render both show the same `null`-driven placeholder (`XpClock`
  renders `--:--` for it), and the real time is only ever set
  client-side, after hydration. There is nothing to reconcile, so
  there's no mismatch to warn about.
- **`src/components/XpTooltip.tsx`** is a small reusable hover/focus/
  tap tooltip styled after real XP tooltips (pale yellow `#ffffe1`,
  thin black border, square corners, no shadow, no fade — it just
  appears) shared by the tray and the "Since 2011" item below. Hover
  shows it after a short 400ms delay (like a native OS tooltip, not an
  instant modern hover-card); keyboard focus shows it immediately
  (no reason to make a keyboard user wait); a tap on touch devices
  reveals it for ~2.5s and auto-dismisses. It's purely presentational —
  the actual accessible name lives in an `aria-label` on each trigger
  button, not in the tooltip bubble (which is `aria-hidden`).
- **"Since 2011"** (`src/components/XpTaskbarItem.tsx`, reused for both
  this and the existing active-case-study label — previously
  duplicated inline styling) is a small taskbar button placed right
  after Start. It carries no explanation on its face; hovering or
  focusing it reveals "2011 — my first computer" via the same
  `XpTooltip` — the year computers/tech entered the story, told as an
  easter egg rather than stated outright.
- **Responsive:** the tray and "Since 2011" use ordinary flexbox
  sizing (no `transform: scale`), so Start, "Since 2011", and the tray
  never overlap at any width — verified with zero overlap down to a
  375px viewport, with the flag+time and Start always fully visible.

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
- The case window is a centered, manually resizable floating window
  (see [Resizable case window](#resizable-case-window)) above ~600px,
  and expands to fill the viewport (minus the taskbar) below that, with
  larger (44px) touch targets for the prev/next controls and no resize
  handles at all — the same ~600px breakpoint both switches the layout
  and turns resizing off.
- The taskbar collapses the "start" label to just its icon below 480px
  to leave room for the active-case button and the "Product Design
  Portfolio" label.
