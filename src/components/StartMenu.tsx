import { useEffect, useRef, type ReactNode } from "react";
import { resume } from "../data/resume";

interface StartMenuProps {
  onClose: () => void;
  children: ReactNode;
}

/**
 * The Windows XP-style Start Menu: a small panel anchored above the Start
 * button (its parent, `Taskbar`, positions it via a `relative` wrapper).
 * Owns focus management and keyboard navigation only — the actual menu
 * items are passed in as children (`StartMenuItem`), since there's a
 * handful of them today and a data-driven list isn't earned yet.
 *
 * Mounting *is* opening (`Taskbar` conditionally renders this), so this
 * component's whole lifecycle is "focus the first item on mount, listen
 * for the ways a menu can close, clean up on unmount" — no open/closed
 * state of its own.
 */
export function StartMenu({ onClose, children }: StartMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [onClose]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (items.length === 0) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        items[(currentIndex + 1 + items.length) % items.length].focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length].focus();
        break;
      case "Home":
        event.preventDefault();
        items[0].focus();
        break;
      case "End":
        event.preventDefault();
        items[items.length - 1].focus();
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Start Menu"
      onKeyDown={handleKeyDown}
      className="absolute bottom-full left-0 z-30 mb-1 w-[280px] overflow-hidden rounded-[4px] border border-xp-window-border bg-xp-window-bg shadow-xp-window max-[380px]:w-[230px]"
    >
      <div className="flex items-center gap-2.5 bg-linear-to-r from-xp-titlebar-start via-xp-titlebar-mid via-40% to-xp-titlebar-end px-3 py-2.5">
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[4px] border border-white/40 bg-linear-to-b from-xp-silver-start to-xp-silver-mid text-xp-sm font-bold text-xp-titlebar-end"
          aria-hidden="true"
        >
          TL
        </span>
        <span className="min-w-0">
          <span className="block truncate text-xp-base font-bold text-white" style={{ textShadow: "1px 1px 1px rgba(0, 0, 0, 0.35)" }}>
            {resume.name}
          </span>
          <span className="block truncate text-xp-xs text-white/85">{resume.title}</span>
        </span>
      </div>

      <div className="flex flex-col gap-0.5 bg-xp-window-content-bg p-1.5">{children}</div>
    </div>
  );
}
