import type { CareerMilestone } from "../types/career";

/**
 * Intentionally empty for now. This is where each `resume.experience`
 * entry (see `src/data/resume.ts`) gets mapped to a `CareerMilestone` with
 * a real `position` once the world has an actual path/layout to place
 * them along — inventing positions before that layout exists would just
 * be placeholder data pretending to be real content. `CareerStation`
 * components should read from this array once it's populated; nothing
 * should hardcode a company name into a scene component directly.
 */
export const careerMilestones: CareerMilestone[] = [];
