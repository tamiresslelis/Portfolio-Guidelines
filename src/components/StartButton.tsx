import xpFlag from "../assets/desktop/xp-flag.svg";

interface StartButtonProps {
  onClick: () => void;
  isMenuOpen: boolean;
}

/**
 * The classic green Windows XP Start button. Opens/closes the Start Menu
 * (see `StartMenu.tsx`) — the menu owns everything about what happens
 * once it's open; this button only knows whether it currently is.
 */
export function StartButton({ onClick, isMenuOpen }: StartButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="menu"
      aria-expanded={isMenuOpen}
      className={`inline-flex h-[calc(100%-6px)] items-center gap-1.5 rounded-l-[4px] rounded-r-[12px] border border-[#1d5f0a] bg-linear-to-b from-xp-start-start via-xp-start-mid to-xp-start-end from-0% via-55% to-100% py-0 pr-3.5 pl-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] hover:brightness-[1.08] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] max-[480px]:rounded-[4px] max-[480px]:px-2.5 ${
        isMenuOpen ? "shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] brightness-95" : ""
      }`}
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
