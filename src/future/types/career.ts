/**
 * The 3D world's own spatial/interactive metadata for a career milestone.
 * Deliberately does NOT duplicate resume prose — `src/future/data/career.ts`
 * builds these from `src/data/resume.ts`'s `ExperienceEntry[]`, which
 * remains the single source of truth for role/dates/bullets. This type
 * only adds what the world needs to *place and summarize* a milestone.
 */
export interface CareerMilestone {
  id: string;
  company: string;
  year: string;
  role: string;
  position: [number, number, number];
  asset?: string;
}
