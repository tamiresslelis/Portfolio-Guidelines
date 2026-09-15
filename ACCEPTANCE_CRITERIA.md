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
