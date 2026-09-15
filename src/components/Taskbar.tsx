import { StartButton } from "./StartButton";

interface TaskbarProps {
  onStartClick: () => void;
  /** Title of the currently open case window, if any, shown as a taskbar button. */
  activeCaseTitle: string | null;
}

/** The Windows XP-style taskbar, fixed to the bottom of the viewport. */
export function Taskbar({ onStartClick, activeCaseTitle }: TaskbarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-20 flex h-[34px] items-center gap-2 border-t border-xp-taskbar-border-top bg-linear-to-b from-xp-taskbar-start to-xp-taskbar-end px-1.5 shadow-[0_-1px_6px_rgba(0,0,0,0.35)]"
    >
      <StartButton onClick={onStartClick} />

      <div className="mx-0 my-1.5 w-px self-stretch bg-black/35 shadow-[1px_0_0_rgba(255,255,255,0.25)]" aria-hidden="true" />

      <div className="flex min-w-0 flex-1 items-center">
        {activeCaseTitle && (
          <span
            className="inline-block max-w-[220px] overflow-hidden rounded-[3px] border border-[#0b2f75] bg-linear-to-b from-[#1c4fb0] to-[#123b8c] px-3 py-1 text-xp-sm text-white text-ellipsis whitespace-nowrap shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] max-[480px]:max-w-[120px]"
            title={activeCaseTitle}
          >
            {activeCaseTitle}
          </span>
        )}
      </div>

      <span className="flex-shrink-0 pr-2 text-right text-xp-sm text-white/90 select-none">
        Product Design Portfolio
      </span>
    </div>
  );
}
