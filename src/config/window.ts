/**
 * Centralized sizing configuration for the resizable case-study window
 * (see `src/hooks/useResizableWindow.ts`).
 */

/** Matches the taskbar's own height (`h-[34px]` in `Taskbar.tsx`) and the
 *  maximized case window's height calc (`h-[calc(100dvh-34px)]` in
 *  `CaseWindow.tsx`) — kept as its own named constant here rather than a
 *  shared CSS token since Tailwind arbitrary values can't reference a JS
 *  constant directly; if the taskbar's height ever changes, update all
 *  three places together. */
export const TASKBAR_HEIGHT_PX = 34;

/**
 * Minimum case window dimensions, sized so the title bar, footer
 * (pagination + counter), and content padding always leave a legible PDF
 * area: chrome overhead is ~112px of horizontal padding (`px-14` on both
 * sides at desktop widths) and ~112px of vertical chrome (32px title bar +
 * ~40px footer + ~40px content padding), leaving roughly 490×340px for the
 * PDF itself at the minimum — small but still readable, with headroom
 * before the nav arrows or pagination dots would crowd it.
 */
export const MIN_CASE_WINDOW_WIDTH_PX = 600;
export const MIN_CASE_WINDOW_HEIGHT_PX = 450;

/** Below this viewport width, the case window uses its existing
 *  full-viewport responsive layout (see the `max-[600px]:` utilities in
 *  `CaseWindow.tsx`) instead of being manually resizable — matches that
 *  same breakpoint exactly so "mobile" means the same thing everywhere. */
export const MOBILE_WINDOW_BREAKPOINT_PX = 600;
