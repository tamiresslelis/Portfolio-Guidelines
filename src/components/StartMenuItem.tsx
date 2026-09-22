import type { ReactNode } from "react";

interface StartMenuItemProps {
  icon: ReactNode;
  label: string;
  /** Small subtitle line under the label — real XP start menu entries use
   *  this for a one-line description, not just an app name. */
  description?: string;
  onSelect: () => void;
  /** "primary" reads as the highlighted, larger entry a real Start Menu
   *  gives its most-used app; "secondary" is the smaller, muted style used
   *  for system-level actions (matches the visual weight split between
   *  the pinned-apps column and the "Log Off"/"Turn Off" row in the
   *  reference). */
  variant?: "primary" | "secondary";
}

/** One row inside `StartMenu`. A real `<button>` with `role="menuitem"` —
 *  arrow-key/Home/End navigation between items is handled by the parent
 *  menu's keydown listener, not by this component. */
export function StartMenuItem({ icon, label, description, onSelect, variant = "primary" }: StartMenuItemProps) {
  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={`group flex w-full items-center gap-3 rounded-[2px] px-3 text-left outline-none hover:bg-linear-to-b hover:from-xp-titlebar-mid hover:to-xp-titlebar-start focus-visible:bg-linear-to-b focus-visible:from-xp-titlebar-mid focus-visible:to-xp-titlebar-start ${
        isPrimary ? "py-2" : "py-1.5"
      }`}
    >
      <span
        className={`flex flex-shrink-0 items-center justify-center rounded-[4px] ${
          isPrimary ? "h-8 w-8" : "h-5 w-5"
        }`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block font-semibold text-[#1a1a1a] group-hover:text-white group-focus-visible:text-white ${
            isPrimary ? "text-xp-base leading-tight" : "truncate text-xp-sm"
          }`}
        >
          {label}
        </span>
        {description && (
          <span
            className={`block truncate text-[#555] group-hover:text-white/85 group-focus-visible:text-white/85 ${isPrimary ? "text-xp-xs" : "hidden"}`}
          >
            {description}
          </span>
        )}
      </span>
    </button>
  );
}
