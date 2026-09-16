import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { resume } from "../data/resume";
import resumePdf from "../assets/resume/tamires-lelis-resume.pdf";

interface ResumeWindowProps {
  /** Red X / Escape: closes immediately, no boot screen. */
  onClose: () => void;
}

const controlButtonBase =
  "flex h-5 w-[22px] items-center justify-center rounded-[2px] text-[11px] leading-none";

/** Splits on `**bold**` spans — a tiny markdown-lite convention, not a full
 *  parser, just enough to highlight stats and product names in the resume
 *  data without pulling in a markdown library. */
function renderRichText(text: string): ReactNode {
  return text.split(/\*\*(.+?)\*\*/g).map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-bold text-[#111]">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

/**
 * The XP-chrome window that hosts the resume. Unlike CaseWindow, the
 * content is a single long, scrollable document rather than a slideshow —
 * there's no slide navigation, swipe, or tooltip here, just a real,
 * selectable/accessible text document plus a link to download the original
 * PDF. Shares the same window-chrome look as CaseWindow (title bar, the
 * same disabled-minimize/working-maximize/working-close buttons) but isn't
 * built on top of it, since the content models are different enough that
 * forcing this into the slide-viewer wouldn't fit.
 */
export function ResumeWindow({ onClose }: ResumeWindowProps) {
  const titleId = useId();
  const windowRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    windowRef.current?.focus();

    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleToggleMaximize = () => {
    setIsMaximized((maximized) => !maximized);
  };

  return (
    <div
      ref={windowRef}
      className={
        isMaximized
          ? "absolute top-0 left-0 z-10 flex h-[calc(100dvh-34px)] w-screen flex-col overflow-hidden bg-xp-window-bg outline-none"
          : "absolute top-1/2 left-1/2 z-10 flex h-[min(680px,86dvh)] w-[min(760px,94vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xp-window border border-xp-window-border bg-xp-window-bg shadow-xp-window outline-none max-[600px]:top-0 max-[600px]:left-0 max-[600px]:h-[calc(100dvh-34px)] max-[600px]:w-screen max-[600px]:translate-x-0 max-[600px]:translate-y-0 max-[600px]:rounded-none"
      }
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <div className="flex h-8 flex-shrink-0 items-center gap-2 border-b border-xp-window-border bg-linear-to-b from-xp-titlebar-mid via-xp-titlebar-start via-45% to-xp-titlebar-end py-0 pr-1.5 pl-2.5">
        <span className="h-4 w-4 flex-shrink-0 rounded-[2px] bg-[#ffd45e]" aria-hidden="true" />
        <h2
          id={titleId}
          className="m-0 min-w-0 flex-1 overflow-hidden text-xp-base font-bold text-ellipsis whitespace-nowrap text-white"
          style={{ textShadow: "1px 1px 1px rgba(0, 0, 0, 0.35)" }}
        >
          Resume — {resume.name}
        </h2>
        <div className="flex flex-shrink-0 gap-[3px]">
          <span
            className={`${controlButtonBase} border border-[#b6bed2] bg-linear-to-b from-[#eef1f8] to-[#d6dceb] text-[#c1c9dc]`}
            aria-hidden="true"
          >
            &#x2013;
          </span>
          <button
            type="button"
            onClick={handleToggleMaximize}
            className={`${controlButtonBase} border border-black/40 bg-linear-to-b from-xp-silver-start to-xp-silver-end text-[#1a1a1a] hover:from-white hover:to-xp-silver-mid active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]`}
            aria-label={isMaximized ? "Restore resume window" : "Maximize resume window"}
            aria-pressed={isMaximized}
          >
            {isMaximized ? (
              <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                <rect x="3.5" y="0.75" width="7.75" height="7.75" fill="none" stroke="currentColor" strokeWidth="1.1" />
                <rect x="0.75" y="3.5" width="7.75" height="7.75" fill="#e8e8e8" stroke="currentColor" strokeWidth="1.1" />
              </svg>
            ) : (
              "□"
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`${controlButtonBase} border border-[#7a1c14] bg-linear-to-b from-xp-close-start to-xp-close-end text-white hover:brightness-110 active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]`}
            aria-label="Close resume"
          >
            &#x2715;
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-xp-window-content-bg px-6 py-5 text-[#1a1a1a] sm:px-10 sm:py-7">
        <article className="mx-auto max-w-2xl">
          <p className="m-0 text-2xl font-bold text-[#111]">{resume.name}</p>
          <p className="mt-1 text-xp-sm font-bold tracking-wide text-[#555] uppercase">{resume.title}</p>

          <p className="mt-4 text-sm leading-relaxed text-[#333]">{resume.summary}</p>

          <p className="mt-4 border-y border-[#ddd] py-2 text-sm font-bold text-[#111]">{resume.stats}</p>

          <section className="mt-5">
            <h3 className="m-0 text-xs font-bold tracking-widest text-[#777] uppercase">Product impact</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#333]">
              {resume.productImpact.map((bullet) => (
                <li key={bullet}>{renderRichText(bullet)}</li>
              ))}
            </ul>
          </section>

          <section className="mt-5">
            <h3 className="m-0 text-xs font-bold tracking-widest text-[#777] uppercase">Expertise</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#333]">{resume.expertise.join(" · ")}</p>
          </section>

          <section className="mt-5">
            <h3 className="m-0 text-xs font-bold tracking-widest text-[#777] uppercase">Work experience</h3>
            <div className="mt-2 space-y-5">
              {resume.experience.map((job) => (
                <div key={job.company + job.dates}>
                  <p className="m-0 text-sm font-bold text-[#111]">
                    {job.company} <span className="font-normal text-[#555]">| {job.role} | {job.dates}</span>
                  </p>
                  <p className="mt-1 text-sm text-[#555] italic">{job.summary}</p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#333]">
                    {job.bullets.map((bullet) => (
                      <li key={bullet}>{renderRichText(bullet)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5 mb-2">
            <h3 className="m-0 text-xs font-bold tracking-widest text-[#777] uppercase">Education / courses</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[#333]">
              {resume.education.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </article>
      </div>

      <div className="flex flex-shrink-0 items-center justify-end border-t border-[#b8b6a8] bg-linear-to-b from-[#f2f1e8] to-[#e4e2d3] px-3 py-1.5">
        <a
          href={resumePdf}
          download="Tamires-Lelis-Resume.pdf"
          className="inline-flex items-center gap-1.5 rounded-[3px] border border-black/40 bg-linear-to-b from-xp-silver-start to-xp-silver-end px-3 py-1 text-xp-xs font-semibold text-[#1a1a1a] hover:from-white hover:to-xp-silver-mid active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
        >
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <path
              d="M8 1.5v8.5M4.5 6.5 8 10l3.5-3.5M2.5 12.5h11"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Download PDF
        </a>
      </div>
    </div>
  );
}
