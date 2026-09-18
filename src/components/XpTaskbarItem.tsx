import type { ReactNode } from "react";

// Shared by the active-case-study label and the "Since 2011" item — both
// are meant to read as the same kind of "pressed-in" open-window taskbar
// button, just one is a live app state and the other purely decorative.
const BASE_CLASSES =
  "inline-block max-w-[220px] overflow-hidden rounded-[3px] border border-[#0b2f75] bg-linear-to-b from-[#1c4fb0] to-[#123b8c] px-3 py-1 text-xp-sm text-white text-ellipsis whitespace-nowrap shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] max-[480px]:max-w-[120px]";

interface XpTaskbarItemProps {
  children: ReactNode;
  /** "span" (default) for a purely visual label; "button" when the item
   *  needs to be focusable/hoverable, e.g. wrapped in `XpTooltip`. */
  as?: "span" | "button";
  ariaLabel?: string;
  /** Native tooltip text (e.g. the full, untruncated case title) — distinct
   *  from `XpTooltip`'s custom XP-styled bubble. */
  title?: string;
}

/** A small taskbar button styled like an open/pressed-in XP application. */
export function XpTaskbarItem({ children, as = "span", ariaLabel, title }: XpTaskbarItemProps) {
  if (as === "button") {
    return (
      <button type="button" className={`${BASE_CLASSES} cursor-default`} aria-label={ariaLabel} title={title}>
        {children}
      </button>
    );
  }

  return (
    <span className={BASE_CLASSES} title={title}>
      {children}
    </span>
  );
}
