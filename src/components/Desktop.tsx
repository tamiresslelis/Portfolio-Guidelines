import type { CSSProperties } from "react";
import type { CaseStudy } from "../data/cases";
import { resume } from "../data/resume";
import { DesktopFolder } from "./DesktopFolder";
import { CaseWindow } from "./CaseWindow";
import { ResumePasswordDialog } from "./ResumePasswordDialog";
import { ResumeWindow } from "./ResumeWindow";
import { Taskbar } from "./Taskbar";
// The real "Bliss" photo, supplied by the project owner (see
// src/assets/desktop/README.md for provenance/rights). vite.config.ts
// disables asset inlining, so these resolve to real file URLs rather
// than data: URIs (see the comment there for why that matters for a
// CSS background-image specifically). Two sizes so phones aren't made
// to download the full desktop-resolution file — see the `.xp-wallpaper`
// media-query swap in styles.css.
import wallpaperDesktop from "../assets/desktop/wallpaper.webp";
import wallpaperMobile from "../assets/desktop/wallpaper-mobile.webp";

interface DesktopProps {
  cases: CaseStudy[];
  activeCase: CaseStudy | null;
  currentSlide: number;
  onOpenCase: (id: string) => void;
  onCloseCase: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onGoToSlide: (index: number) => void;
  onRestartDesktop: () => void;
  onViewFuture: () => void;
  showNavigationTooltip: boolean;
  onDismissNavigationTooltip: () => void;
  isResumeOpen: boolean;
  isResumeUnlocked: boolean;
  onOpenResume: () => void;
  onCloseResume: () => void;
  onUnlockResume: () => void;
}

/**
 * The Windows XP desktop: wallpaper, case-study folder icons, the resume
 * folder, the (optional) open case/resume window, and the taskbar. This is
 * the composition root for everything that isn't the boot screen.
 */
export function Desktop({
  cases,
  activeCase,
  currentSlide,
  onOpenCase,
  onCloseCase,
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
  onRestartDesktop,
  onViewFuture,
  showNavigationTooltip,
  onDismissNavigationTooltip,
  isResumeOpen,
  isResumeUnlocked,
  onOpenResume,
  onCloseResume,
  onUnlockResume,
}: DesktopProps) {
  const activeWindowTitle =
    activeCase?.title ??
    (isResumeOpen ? (isResumeUnlocked ? `Resume — ${resume.name}` : "Password required") : null);

  return (
    <div
      className="xp-wallpaper absolute inset-0 overflow-hidden bg-xp-desktop-fallback bg-cover bg-center bg-no-repeat"
      style={
        {
          "--wallpaper-mobile": `url(${wallpaperMobile})`,
          "--wallpaper-desktop": `url(${wallpaperDesktop})`,
        } as CSSProperties
      }
    >
      <ul className="absolute inset-0 bottom-[34px] m-0 flex list-none flex-col flex-wrap content-start gap-2 p-10 max-[600px]:bottom-auto max-[600px]:flex-row max-[600px]:p-3">
        {cases.map((caseStudy) => (
          <li key={caseStudy.id}>
            <DesktopFolder
              id={caseStudy.id}
              title={caseStudy.folderLabel}
              isOpen={activeCase?.id === caseStudy.id}
              onOpen={onOpenCase}
            />
          </li>
        ))}
        <li>
          <DesktopFolder id="resume" title="Resume" isOpen={isResumeOpen} onOpen={onOpenResume} />
        </li>
      </ul>

      {activeCase && (
        <CaseWindow
          caseStudy={activeCase}
          currentSlide={currentSlide}
          onClose={onCloseCase}
          onPrev={onPrevSlide}
          onNext={onNextSlide}
          onGoToSlide={onGoToSlide}
          showNavigationTooltip={showNavigationTooltip}
          onDismissNavigationTooltip={onDismissNavigationTooltip}
        />
      )}

      {isResumeOpen &&
        (isResumeUnlocked ? (
          <ResumeWindow onClose={onCloseResume} />
        ) : (
          <ResumePasswordDialog onClose={onCloseResume} onUnlock={onUnlockResume} />
        ))}

      <Taskbar onRestartDesktop={onRestartDesktop} onViewFuture={onViewFuture} activeCaseTitle={activeWindowTitle} />
    </div>
  );
}
