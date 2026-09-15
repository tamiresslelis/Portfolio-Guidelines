import xpFlag from "../assets/desktop/xp-flag.svg";

interface StartButtonProps {
  onClick: () => void;
}

/**
 * The classic green Windows XP Start button. Intentionally does NOT open a
 * start menu — clicking it triggers the short boot/loading screen and
 * returns to the desktop (see `routes/index.tsx` / `src/config/timing.ts`).
 */
export function StartButton({ onClick }: StartButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[calc(100%-6px)] items-center gap-1.5 rounded-l-[4px] rounded-r-[12px] border border-[#1d5f0a] bg-linear-to-b from-xp-start-start via-xp-start-mid to-xp-start-end from-0% via-55% to-100% py-0 pr-3.5 pl-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] hover:brightness-[1.08] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] max-[480px]:rounded-[4px] max-[480px]:px-2.5"
      aria-label="start"
    >
      <img src={xpFlag} alt="" width={18} height={18} className="flex-shrink-0" />
      <span
        className="text-xp-md font-bold text-white italic max-[480px]:hidden"
        style={{ textShadow: "1px 1px 1px rgba(0, 0, 0, 0.4)" }}
      >
        start
      </span>
    </button>
  );
}
