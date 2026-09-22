/**
 * The 3D world's own spatial/interactive metadata for one project
 * landmark. Deliberately does NOT duplicate resume/case-study prose —
 * `src/future/data/landmarks.ts` builds these from `src/data/resume.ts`
 * and `src/data/cases.ts`, which remain the single sources of truth for
 * role/dates/bullets/PDF content. This type only adds what the world
 * needs to *place, summarize, and link back* to that real content.
 */
export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectLandmark {
  id: string;
  /** Matches a `CaseStudy.id` in `src/data/cases.ts` — how "Open full
   *  case study" hands off to the real PDF viewer on the 2011 side. */
  caseStudyId: string;
  title: string;
  company: string;
  role: string;
  /** One or two sentences of honest context, not the full case study —
   *  the detailed version lives behind "Open full case study". */
  problem: string;
  metrics: ProjectMetric[];
  position: [number, number, number];
}
