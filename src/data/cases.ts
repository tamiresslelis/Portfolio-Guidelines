/**
 * Case-study content.
 *
 * The Itaú slides are the real deck exported from Figma. The two Insense
 * cases are still lightweight placeholders generated to keep the project
 * runnable out of the box (see `src/assets/cases/*`) — replace the `src` of
 * each slide with the real artwork the same way Itaú's were swapped in; the
 * component tree does not need to change.
 */

import itauSlide01 from "../assets/cases/itau/01-cover.jpg";
import itauSlide02 from "../assets/cases/itau/02-business-context.jpg";
import itauSlide03 from "../assets/cases/itau/03-understanding-existing-experience.jpg";
import itauSlide04 from "../assets/cases/itau/04-userflow.jpg";
import itauSlide05 from "../assets/cases/itau/05-usability-test.jpg";
import itauSlide06 from "../assets/cases/itau/06-usability-data-analysis.jpg";
import itauSlide07 from "../assets/cases/itau/07-v1-vs-final.jpg";
import itauSlide08 from "../assets/cases/itau/08-accessibility-specifications.jpg";
import itauSlide09 from "../assets/cases/itau/09-handoff.jpg";
import itauSlide10 from "../assets/cases/itau/10-outcome.jpg";

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
    title: "Itaú — Foreign Currency Transactions",
    summary:
      "Bringing Itaú's foreign currency transaction workflow from Bankline desktop to mobile.",
    slides: [
      {
        id: "cover",
        image: itauSlide01,
        alt: "Cover slide: “Case Itaú — Foreign Currency Transactions,” over an aerial photo of a shipping container port, with the Itaú logo and Brazilian flag.",
      },
      {
        id: "business-context",
        image: itauSlide02,
        alt: "Business context: in 2021, Bankline handled about 1,000 foreign currency transactions per day, the baseline for measuring mobile adoption. Customers needed to manage these transactions on the go, creating an opportunity to bring the desktop experience to mobile. By 2024, Itaú Unibanco reported 1.7 million operations and USD 242 billion in transaction volume. Alongside: a mobile screenshot of the “câmbio e comércio” (foreign exchange and trade) screen showing company data, indicative USD/EUR rates, and a balance of pending payment orders.",
      },
      {
        id: "understanding-existing-experience",
        image: itauSlide03,
        alt: "Understanding the existing experience: reviewed the Bankline desktop journey and its ~1,000 daily foreign currency transactions, mapped user flows, business rules, API dependencies, and edge cases with Product, Engineering, and QA, then used those findings to identify mobile constraints. Screenshots show the dense Bankline desktop interface with browser devtools open, plus “operation unavailable” and “pending CNPJ registration” error messages.",
      },
      {
        id: "userflow",
        image: itauSlide04,
        alt: "Userflow: a single screen needed to support 10 different restriction scenarios without creating dead ends for users. A dense flow diagram maps dozens of connected mobile screens and decision branches.",
      },
      {
        id: "usability-test",
        image: itauSlide05,
        alt: "Usability test: six remotely moderated usability tests were run with Itaú customers to validate that the experience was clear and easy to use before launch, with the Product Manager, Ricardo, joining the sessions. A grid of video-call screenshots shows participants and researchers mid-session.",
      },
      {
        id: "usability-data-analysis",
        image: itauSlide06,
        alt: "Usability data analysis: the information architecture of the “Dados do contato” card accounted for 84% of errors; testing surfaced a clearer label, reducing confusion and support tickets. A results table shows task-completion rates across 6 interviews and 10 tasks — mostly green (fully completed), with Task 6 mostly red (failed).",
      },
      {
        id: "v1-vs-final",
        image: itauSlide07,
        alt: "Side-by-side comparison of two mobile screen versions: v1 labels a field “dados do contato” (contact details), while the Final version relabels it “seus dados para contato” (your contact details) — the change highlighted with a red circle.",
      },
      {
        id: "accessibility-specifications",
        image: itauSlide08,
        alt: "Accessibility specifications: Itaú has around 100 million customers, and about 10 million Brazilians have some degree of hearing loss — including the author. Part of the role was defining accessibility specs for engineering. A mobile screen for linking bank accounts via Open Banking is annotated with numbered callouts distinguishing clickable vs. non-clickable elements and how each should be announced by a screen reader.",
      },
      {
        id: "handoff",
        image: itauSlide09,
        alt: "Handoff: it's also a Product Designer's responsibility to write user stories and acceptance criteria so requirements are followed by developers. A mobile “pending exchange contract” warning screen is annotated with sticky notes containing user-story text and acceptance criteria — e.g. validating contract periods, showing an error message for pending items, and disabling landscape rotation.",
      },
      {
        id: "outcome",
        image: itauSlide10,
        alt: "Outcome: the redesign made a complex transaction easier to follow by clearly showing status, processing time, and next steps; early validation also avoided about 2 weeks of engineering work on an unvalidated solution. A mobile screen shows a currency-quote request in progress (“Aguarde, estamos buscando as taxas... aproximadamente 14 segundos”) alongside customer quotes: Felipe notes that formalizing on mobile would avoid having to log into Bankline, and Elizangela says the process felt fast, simple, and self-explanatory.",
      },
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
