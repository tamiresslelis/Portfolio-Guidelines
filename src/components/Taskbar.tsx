import { StartButton } from "./StartButton";
import { XpTaskbarItem } from "./XpTaskbarItem";
import { XpTooltip } from "./XpTooltip";
import { XpSystemTray } from "./XpSystemTray";

interface TaskbarProps {
  onStartClick: () => void;
  /** Title of the currently open case window, if any, shown as a taskbar button. */
  activeCaseTitle: string | null;
}

const SINCE_2011_TOOLTIP = "2011 — my first computer";

/** The Windows XP-style taskbar, fixed to the bottom of the viewport. */
export function Taskbar({ onStartClick, activeCaseTitle }: TaskbarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-20 flex h-[34px] items-center gap-2 border-t border-xp-taskbar-border-top bg-linear-to-b from-xp-taskbar-start to-xp-taskbar-end px-1.5 shadow-[0_-1px_6px_rgba(0,0,0,0.35)]"
    >
      <StartButton onClick={onStartClick} />

      <div className="mx-0 my-1.5 w-px self-stretch bg-black/35 shadow-[1px_0_0_rgba(255,255,255,0.25)]" aria-hidden="true" />

      {/* A quiet, explorable detail rather than portfolio copy: the
          tooltip carries the actual story, the button just says "Since
          2011" — the year computers/tech entered the picture. */}
      <XpTooltip label={SINCE_2011_TOOLTIP} align="left">
        <XpTaskbarItem as="button" ariaLabel={`Since 2011 — ${SINCE_2011_TOOLTIP}`}>
          Since 2011
        </XpTaskbarItem>
      </XpTooltip>

      <div className="flex min-w-0 flex-1 items-center">
        {activeCaseTitle && <XpTaskbarItem title={activeCaseTitle}>{activeCaseTitle}</XpTaskbarItem>}
      </div>

      <XpSystemTray />
    </div>
  );
}
