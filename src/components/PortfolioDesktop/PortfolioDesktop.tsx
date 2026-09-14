import type { CaseStudy } from "../../data/cases";
import { PortfolioFolder } from "../PortfolioFolder";
import { CaseWindow } from "../CaseWindow";
import { XPTaskbar } from "../XPTaskbar";
import styles from "./PortfolioDesktop.module.css";

interface PortfolioDesktopProps {
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
}

/**
 * The Windows XP desktop: wallpaper, case-study folder icons, the (optional)
 * open case window, and the taskbar. This is the composition root for
 * everything that isn't the boot screen.
 */
export function PortfolioDesktop({
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
}: PortfolioDesktopProps) {
  return (
    <div className={styles.desktop}>
      <ul className={styles.iconGrid}>
        {cases.map((caseStudy) => (
          <li key={caseStudy.id}>
            <PortfolioFolder
              id={caseStudy.id}
              label={caseStudy.folderLabel}
              isOpen={activeCase?.id === caseStudy.id}
              onOpen={onOpenCase}
            />
          </li>
        ))}
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

      <XPTaskbar onStartClick={onStartClick} activeCaseTitle={activeCase?.title ?? null} />
    </div>
  );
}
