import type { CaseStudy } from "../data/cases";
import { resume } from "../data/resume";
import { DesktopFolder } from "./DesktopFolder";
import { CaseWindow } from "./CaseWindow";
import { ResumePasswordDialog } from "./ResumePasswordDialog";
import { ResumeWindow } from "./ResumeWindow";
import { Taskbar } from "./Taskbar";
// The real "Bliss" photo, supplied by the project owner (see
// src/assets/desktop/README.md for provenance/rights). vite.config.ts
// disables asset inlining, so this resolves to a real file URL rather
// than a data: URI (see the comment there for why that matters for a
// CSS background-image specifically).
import wallpaper from "../assets/desktop/wallpaper.webp";

interface DesktopProps {
  cases: CaseStudy[];
  activeCase: CaseStudy | null;
  currentSlide: number;
  onOpenCase: (id: string) => void;
  onCloseCase: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onGoToSlide: (index: number) => void;
  onStartClick: () => void;
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
  onStartClick,
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
      className="absolute inset-0 overflow-hidden bg-xp-desktop-fallback bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${wallpaper})` }}
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

      <Taskbar onStartClick={onStartClick} activeCaseTitle={activeWindowTitle} />
    </div>
  );
}
