import type { ProjectLandmark } from "../types/career";

/**
 * One populated landmark — the vertical slice this is meant to validate
 * before the remaining three (Itaú, Insense AI, Quick Win) get their own
 * entries the same way. `metrics`/`problem` are curated summaries of what
 * already exists in `src/data/resume.ts`'s Insense entry, not new claims —
 * the real detail lives behind `caseStudyId`, opened via "Open full case
 * study" (see `ProjectOverlay.tsx`), which hands off to the actual PDF
 * case study already built for the 2011 side rather than re-authoring it
 * here.
 */
export const projectLandmarks: ProjectLandmark[] = [
  {
    id: "insense-onboarding",
    caseStudyId: "insense-onboarding",
    title: "Creator Onboarding",
    company: "Insense",
    role: "Senior Product Designer",
    problem:
      "Creator onboarding had a 32% drop-off rate — many creators abandoned the flow before their profile was ready to apply for campaigns.",
    metrics: [
      { label: "Onboarding drop-off", value: "32% → 18%" },
      { label: "Activation", value: "+14%" },
      { label: "Social connection", value: "47.5% → 51%" },
    ],
    position: [0, 0, -14],
  },
];
