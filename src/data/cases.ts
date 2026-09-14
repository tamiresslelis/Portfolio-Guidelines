/**
 * Case-study content.
 *
 * The images below are lightweight placeholders generated to keep the
 * project runnable out of the box (see `src/assets/cases/*`). Replace the
 * `src` of each slide with the real artwork exported from Figma — the
 * component tree does not need to change.
 */

import itauSlide1 from "../assets/cases/itau/slide-1-cover.svg";
import itauSlide2 from "../assets/cases/itau/slide-2-context.svg";
import itauSlide3 from "../assets/cases/itau/slide-3-process.svg";
import itauSlide4 from "../assets/cases/itau/slide-4-solution.svg";
import itauSlide5 from "../assets/cases/itau/slide-5-outcome.svg";

import onboardingSlide1 from "../assets/cases/insense-onboarding/slide-1-cover.svg";
import onboardingSlide2 from "../assets/cases/insense-onboarding/slide-2-context.svg";
import onboardingSlide3 from "../assets/cases/insense-onboarding/slide-3-process.svg";
import onboardingSlide4 from "../assets/cases/insense-onboarding/slide-4-solution.svg";
import onboardingSlide5 from "../assets/cases/insense-onboarding/slide-5-outcome.svg";

import aiSlide1 from "../assets/cases/insense-ai/slide-1-cover.svg";
import aiSlide2 from "../assets/cases/insense-ai/slide-2-context.svg";
import aiSlide3 from "../assets/cases/insense-ai/slide-3-process.svg";
import aiSlide4 from "../assets/cases/insense-ai/slide-4-solution.svg";
import aiSlide5 from "../assets/cases/insense-ai/slide-5-outcome.svg";

export interface CaseSlideData {
  id: string;
  image: string;
  alt: string;
  caption?: string;
}

export interface CaseStudy {
  id: string;
  /** Label shown under the desktop folder icon. */
  folderLabel: string;
  /** Title shown in the case window's title bar. */
  title: string;
  /** Short description, available for future use (e.g. tooltips, meta tags). */
  summary: string;
  slides: CaseSlideData[];
}

export const cases: CaseStudy[] = [
  {
    id: "itau",
    folderLabel: "Itaú",
    title: "Itaú — Case Study",
    summary: "Product design case study for Itaú.",
    slides: [
      { id: "cover", image: itauSlide1, alt: "Itaú case study cover slide" },
      { id: "context", image: itauSlide2, alt: "Context and problem statement" },
      { id: "process", image: itauSlide3, alt: "Research and design process" },
      { id: "solution", image: itauSlide4, alt: "Final solution overview" },
      { id: "outcome", image: itauSlide5, alt: "Outcomes and impact" },
    ],
  },
  {
    id: "insense-onboarding",
    folderLabel: "Insense — Onboarding",
    title: "Insense Onboarding — Case Study",
    summary: "Onboarding experience design case study for Insense.",
    slides: [
      { id: "cover", image: onboardingSlide1, alt: "Insense onboarding case study cover slide" },
      { id: "context", image: onboardingSlide2, alt: "Context and problem statement" },
      { id: "process", image: onboardingSlide3, alt: "Research and design process" },
      { id: "solution", image: onboardingSlide4, alt: "Final solution overview" },
      { id: "outcome", image: onboardingSlide5, alt: "Outcomes and impact" },
    ],
  },
  {
    id: "insense-ai",
    folderLabel: "Insense — AI",
    title: "Insense AI — Case Study",
    summary: "AI feature design case study for Insense.",
    slides: [
      { id: "cover", image: aiSlide1, alt: "Insense AI case study cover slide" },
      { id: "context", image: aiSlide2, alt: "Context and problem statement" },
      { id: "process", image: aiSlide3, alt: "Research and design process" },
      { id: "solution", image: aiSlide4, alt: "Final solution overview" },
      { id: "outcome", image: aiSlide5, alt: "Outcomes and impact" },
    ],
  },
];

export const getCaseById = (id: string | null): CaseStudy | undefined =>
  id ? cases.find((c) => c.id === id) : undefined;
