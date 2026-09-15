import { useEffect } from "react";

const AUTO_DISMISS_MS = 4000;

interface NavigationTooltipProps {
  visible: boolean;
  onDismiss: () => void;
}

/**
 * First-time hint pointing visitors at the slide navigation. Shown once per
 * session (tracked in `routes/index.tsx`) and dismissed automatically, on
 * close, or on the first navigation action.
 */
export function NavigationTooltip({ visible, onDismiss }: NavigationTooltipProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-sm border border-black bg-[#ffffe1] py-1.5 pr-2 pl-3 shadow-[2px_2px_6px_rgba(0,0,0,0.35)] animate-xp-fade-in motion-reduce:animate-none"
      role="status"
    >
      <p className="m-0 text-xp-xs whitespace-nowrap text-[#111] max-[480px]:whitespace-normal">
        Use ← → or swipe to browse slides
      </p>
      <button
        type="button"
        className="border-0 bg-transparent px-1 py-0.5 text-sm leading-none text-[#111]"
        onClick={onDismiss}
        aria-label="Dismiss hint"
      >
        ×
      </button>
    </div>
  );
}
