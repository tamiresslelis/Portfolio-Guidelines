import { useEffect, useId, useRef } from "react";
import type { ProjectLandmark } from "../types/career";

interface ProjectOverlayProps {
  landmark: ProjectLandmark;
  onClose: () => void;
  onOpenFullCaseStudy: (caseStudyId: string) => void;
}

/**
 * The "premium portfolio case-study interface" that opens over the
 * (dimmed, still-visible) 3D world once a landmark is activated — metrics
 * are the visually prominent element, per the requirement that case
 * studies stay more important than the environment around them. This is
 * a curated summary, not the full case study: "Open full case study"
 * hands off to the real PDF viewer already built for the 2011 side
 * (`caseStudyId` matches a `CaseStudy.id` in `src/data/cases.ts`) rather
 * than re-implementing case-study reading inside the 3D route.
 */
export function ProjectOverlay({ landmark, onClose, onOpenFullCaseStudy }: ProjectOverlayProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 p-4 font-sans backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Frosted-glass card rather than a flat solid panel — matching the
          reference's floating dark UI cards: translucent, blurred,
          softly bordered, so it reads as an object *in* the scene rather
          than a modal slapped on top of it. */}
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#0d1712]/85 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="m-0 text-xs font-medium tracking-[2px] text-[#8fc4ff] uppercase">{landmark.company}</p>
            <h2 id={titleId} className="m-0 mt-1 text-xl font-semibold text-white">
              {landmark.title}
            </h2>
            <p className="m-0 mt-0.5 text-sm text-white/60">{landmark.role}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-white/80">{landmark.problem}</p>

        <dl className="mt-5 grid grid-cols-3 gap-2">
          {landmark.metrics.map((metric) => (
            <div key={metric.label} className="rounded-md border border-white/10 bg-white/5 p-2.5 text-center">
              <dd className="m-0 text-sm font-bold text-[#e0b23c] sm:text-base">{metric.value}</dd>
              <dt className="m-0 mt-1 text-[10px] tracking-wide text-white/50 uppercase">{metric.label}</dt>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={() => onOpenFullCaseStudy(landmark.caseStudyId)}
          className="mt-6 w-full rounded-md bg-[#e0b23c] py-2.5 text-sm font-semibold text-[#12241f] hover:brightness-105"
        >
          Open full case study →
        </button>
      </div>
    </div>
  );
}
