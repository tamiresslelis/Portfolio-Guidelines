import { useRef, useState } from "react";
import { StartButton } from "./StartButton";
import { StartMenu } from "./StartMenu";
import { StartMenuItem } from "./StartMenuItem";
import { XpTaskbarItem } from "./XpTaskbarItem";
import { XpTooltip } from "./XpTooltip";
import { XpSystemTray } from "./XpSystemTray";

interface TaskbarProps {
  /** Restarts the 2011 desktop's own boot sequence — the taskbar's
   *  previous "click Start to reboot" behavior, now reachable as a Start
   *  Menu item instead of the button's direct action. */
  onRestartDesktop: () => void;
  /** Begins the 2011 → future transition (see EvolutionTransition.tsx). */
  onViewFuture: () => void;
  /** Title of the currently open case window, if any, shown as a taskbar button. */
  activeCaseTitle: string | null;
}

const SINCE_2011_TOOLTIP = "2011 — my first computer";

function FutureIcon() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="url(#future-icon-gradient)" stroke="#123b36" strokeWidth="1" />
      <path
        d="M12 10.5 19 16l-7 5.5"
        fill="none"
        stroke="#0c1a18"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="future-icon-gradient" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#e0b23c" />
          <stop offset="100%" stopColor="#2d7d72" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <path
        d="M15.5 6A6 6 0 1 0 16 10"
        fill="none"
        stroke="#3a5a8c"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M16 3v4h-4" fill="none" stroke="#3a5a8c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The Windows XP-style taskbar, fixed to the bottom of the viewport. */
export function Taskbar({ onRestartDesktop, onViewFuture, activeCaseTitle }: TaskbarProps) {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const closeStartMenu = () => {
    setIsStartMenuOpen(false);
    previouslyFocusedRef.current?.focus?.();
  };

  const handleStartButtonClick = () => {
    if (isStartMenuOpen) {
      closeStartMenu();
      return;
    }
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    setIsStartMenuOpen(true);
  };

  const handleViewFutureSelect = () => {
    closeStartMenu();
    onViewFuture();
  };

  const handleRestartSelect = () => {
    closeStartMenu();
    onRestartDesktop();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 flex h-[34px] items-center gap-2 border-t border-xp-taskbar-border-top bg-linear-to-b from-xp-taskbar-start to-xp-taskbar-end px-1.5 shadow-[0_-1px_6px_rgba(0,0,0,0.35)]">
      <div className="relative flex h-full flex-shrink-0 items-center">
        <StartButton onClick={handleStartButtonClick} isMenuOpen={isStartMenuOpen} />
        {isStartMenuOpen && (
          <StartMenu onClose={closeStartMenu}>
            <StartMenuItem
              icon={<FutureIcon />}
              label="View portfolio in the future"
              description="A 2026 interactive career journey"
              onSelect={handleViewFutureSelect}
            />
            <div className="my-1 h-px bg-black/10" role="separator" aria-hidden="true" />
            <StartMenuItem icon={<RestartIcon />} label="Restart Desktop" onSelect={handleRestartSelect} variant="secondary" />
          </StartMenu>
        )}
      </div>

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
