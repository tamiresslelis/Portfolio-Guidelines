# Boot screen assets

The Windows XP boot / loading screen is built with Tailwind utilities
and inline SVG (`src/components/XPBootScreen.tsx`) rather than a bitmap
screenshot, so it stays crisp at any size and needs zero binary assets
to run.

If you'd rather use the exact screenshot exported from the Figma file,
drop it here (e.g. `xp-boot.png`) and swap the markup in
`XPBootScreen.tsx` for an `<img>` pointing at it. Keep the same
`visible`/`label` prop contract so the two boot durations
(`INITIAL_BOOT_DURATION`, `START_BOOT_DURATION` in `src/config/timing.ts`,
applied through `useBootSequence`) keep working unchanged.
