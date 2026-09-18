/**
 * Case-study content. Each case is rendered directly from its original
 * PDF (see `public/cases/*.pdf`) rather than from exported page images —
 * `CaseStudyViewer` renders `slides[currentSlide]`'s page number
 * (`index + 1`) out of `pdfUrl` via react-pdf/PDF.js. `alt`/`caption` stay
 * hand-written per page since a rendered PDF canvas has no text of its own
 * for assistive tech to read.
 */

export interface CaseSlideData {
  id: string;
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
  /** Path to this case's PDF, served as a static file from `public/cases/`. */
  pdfUrl: string;
  /** One entry per PDF page, in page order — `slides[i]` is page `i + 1`. */
  slides: CaseSlideData[];
}

// `public/` files are copied to the build output as-is and must be
// referenced with the deployed base path prefix, same as favicon.png in
// `routes/__root.tsx` — GitHub Pages serves this app from `/<repo-name>/`,
// not the domain root (see vite.config.ts).
const casePdfUrl = (fileName: string) => `${import.meta.env.BASE_URL}cases/${fileName}`;

export const cases: CaseStudy[] = [
  {
    id: "itau",
    folderLabel: "Case Itaú: Foreign Currency Transactions",
    title: "Itaú — Foreign Currency Transactions",
    summary:
      "Bringing Itaú's foreign currency transaction workflow from Bankline desktop to mobile.",
    pdfUrl: casePdfUrl("itau.pdf"),
    slides: [
      {
        id: "cover",
        alt: "Cover slide: “Case Itaú — Foreign Currency Transactions,” over an aerial photo of a shipping container port, with the Itaú logo and Brazilian flag.",
      },
      {
        id: "business-context",
        alt: "Business context: in 2021, Bankline handled about 1,000 foreign currency transactions per day, the baseline for measuring mobile adoption. Customers needed to manage these transactions on the go, creating an opportunity to bring the desktop experience to mobile. By 2024, Itaú Unibanco reported 1.7 million operations and USD 242 billion in transaction volume. Alongside: a mobile screenshot of the “câmbio e comércio” (foreign exchange and trade) screen showing company data, indicative USD/EUR rates, and a balance of pending payment orders.",
      },
      {
        id: "understanding-existing-experience",
        alt: "Understanding the existing experience: reviewed the Bankline desktop journey and its ~1,000 daily foreign currency transactions, mapped user flows, business rules, API dependencies, and edge cases with Product, Engineering, and QA, then used those findings to identify mobile constraints. Screenshots show the dense Bankline desktop interface with browser devtools open, plus “operation unavailable” and “pending CNPJ registration” error messages.",
      },
      {
        id: "userflow",
        alt: "Userflow: a single screen needed to support 10 different restriction scenarios without creating dead ends for users. A dense flow diagram maps dozens of connected mobile screens and decision branches.",
      },
      {
        id: "usability-test",
        alt: "Usability test: six remotely moderated usability tests were run with Itaú customers to validate that the experience was clear and easy to use before launch, with the Product Manager, Ricardo, joining the sessions. A grid of video-call screenshots shows participants and researchers mid-session.",
      },
      {
        id: "usability-data-analysis",
        alt: "Usability data analysis: the information architecture of the “Dados do contato” card accounted for 84% of errors; testing surfaced a clearer label, reducing confusion and support tickets. A results table shows task-completion rates across 6 interviews and 10 tasks — mostly green (fully completed), with Task 6 mostly red (failed).",
      },
      {
        id: "v1-vs-final",
        alt: "Side-by-side comparison of two mobile screen versions: v1 labels a field “dados do contato” (contact details), while the Final version relabels it “seus dados para contato” (your contact details) — the change highlighted with a red circle.",
      },
      {
        id: "accessibility-specifications",
        alt: "Accessibility specifications: Itaú has around 100 million customers, and about 10 million Brazilians have some degree of hearing loss — including the author. Part of the role was defining accessibility specs for engineering. A mobile screen for linking bank accounts via Open Banking is annotated with numbered callouts distinguishing clickable vs. non-clickable elements and how each should be announced by a screen reader.",
      },
      {
        id: "handoff",
        alt: "Handoff: it's also a Product Designer's responsibility to write user stories and acceptance criteria so requirements are followed by developers. A mobile “pending exchange contract” warning screen is annotated with sticky notes containing user-story text and acceptance criteria — e.g. validating contract periods, showing an error message for pending items, and disabling landscape rotation.",
      },
      {
        id: "outcome",
        alt: "Outcome: the redesign made a complex transaction easier to follow by clearly showing status, processing time, and next steps; early validation also avoided about 2 weeks of engineering work on an unvalidated solution. A mobile screen shows a currency-quote request in progress (“Aguarde, estamos buscando as taxas... aproximadamente 14 segundos”) alongside customer quotes: Felipe notes that formalizing on mobile would avoid having to log into Bankline, and Elizangela says the process felt fast, simple, and self-explanatory.",
      },
    ],
  },
  {
    id: "insense-onboarding",
    folderLabel: "Case Insense: Onboarding",
    title: "Insense — Onboarding",
    summary: "Reducing onboarding drop-off for creators on Insense's two-sided marketplace.",
    pdfUrl: casePdfUrl("insense-onboarding.pdf"),
    slides: [
      {
        id: "cover",
        alt: "Cover slide: “Case Insense: Onboarding,” on a dark teal background with the Insense logo and a US flag.",
      },
      {
        id: "business-context",
        alt: "Business context, 2025 baseline: Insense is a two-sided marketplace where brands hire creators and creators apply for campaigns; every abandoned onboarding reduced the number of searchable, campaign-ready creator profiles available to brands. Brands subscribe to create campaigns and hire creators, so creators need to complete onboarding with the information required to match campaign requirements. Alongside: three onboarding screens — name entry, birthdate, and a location search field.",
      },
      {
        id: "diagnosis",
        alt: "Diagnosis: the issue wasn't simply the number of questions, it was the perceived cost of answering them. A step-by-step review surfaced three recurring reasons creators hesitated, slowed down, or left the flow: (1) unclear value — asked for profile data before the benefit was obvious; (2) high effort — some steps felt heavier than the value they unlocked; (3) trust concerns — sensitive questions needed more context to feel justified.",
      },
      {
        id: "research-signals",
        alt: "Three signals revealed the same friction: product data (Amplitude) showed drop-off increased where the value of answering was unclear; a competitor-flow scan compared how other products explain value during onboarding; and creator immersion — experiencing the creator setup and expectations firsthand — pointed to the same root issue: creators were asked for effort before understanding the value of answering.",
      },
      {
        id: "value-exchange-clarity",
        alt: "Users continued when the value exchange was clear: each onboarding step was rewritten to make the exchange explicit — why the information is needed, how it improves relevance, and what the creator receives in return. An annotated mobile screen shows a birthdate step reworded to “Share your birthday to unlock tailored opportunities and verify your eligibility easily.”",
      },
      {
        id: "v1-vs-final",
        alt: "v1-vs-Final comparison of a “What content do you create?” category-selection step: the Final version introduces small icons next to each category (Health & Wellness, Food & Drinks, Home & Garden, Fashion & Style) as visual cues, improving recognition and scanability so users could identify relevant categories faster and with less cognitive effort.",
      },
      {
        id: "outcome",
        alt: "Outcome: onboarding drop-off fell from 32% to 18%, increasing the number of campaign-ready creators — more creators could apply for campaigns, giving brands a stronger pool of talent to launch successfully. Alongside: a screenshot of the Insense brand dashboard listing active campaigns, hires, and chats.",
      },
    ],
  },
  {
    id: "insense-ai",
    folderLabel: "Case Insense: AI-Assisted Content Review",
    title: "Insense — AI-Assisted Content Review",
    summary:
      "A Gemini-powered mobile prototype that checks creator content against brand requirements before submission.",
    pdfUrl: casePdfUrl("insense-ai.pdf"),
    slides: [
      {
        id: "cover",
        alt: "Cover slide: “Case Insense: AI-Assisted Content Review,” on a dark teal background with the Insense logo and a US flag.",
      },
      {
        id: "project-overview",
        alt: "Project overview, “AI-Assisted UGC Compliance”: designed and built a Gemini-powered mobile prototype that evaluates creator content against brand requirements and returns structured, actionable feedback in under 3 minutes. Role: Product Designer, Product Strategy, Prototyping, Front-end. Built with React Native, TypeScript, and the Gemini API. Timeline: 4 weeks. GitHub: github.com/tamiresslelis/contentreview. Alongside: an “Add your content” mobile screen with uploaded videos and “Start AI review” / “Skip AI review” buttons.",
      },
      {
        id: "ai-review-flow",
        alt: "Three-screen AI review flow: a “Quick AI review” consent modal explaining the automated check and requiring agreement before starting; a “3 videos need fixes” summary listing how many issues were flagged per video, with “Fix all” and “Submit” actions; and a Video 1 detail screen showing the AI's structured feedback checklist (e.g. “Fast & Convenient,” “Effective Formula,” “Instant Brightening”) with a “Well done! This content is following the brief requirements” confirmation.",
      },
    ],
  },
  {
    id: "quick-win",
    folderLabel: "Quick Win",
    title: "Ritchie Bros — Quick Win",
    summary:
      "A fast usability fix for Ritchie Bros' auction listing page: cutting perceived wait time with clearer loading feedback.",
    pdfUrl: casePdfUrl("quick-win.pdf"),
    slides: [
      {
        id: "cover",
        alt: "Cover slide: “Case Ritchie Bros: Quick win,” with the Ritchie Bros (rb) logo and a US flag.",
      },
      {
        id: "question",
        alt: "Question: “How fast do the website have to be?” — team discussion notes suggest checking response times of competitors like Auctiontime, bidadoo, and Purplewave. Alongside: a screenshot of the Ritchie Bros auction-events listing page, showing a grid of auction cards (location, item count, “Bidding open” badges, “View items” buttons).",
      },
      {
        id: "diagnosis",
        alt: "Diagnosis: users wait around 15 seconds to access auction items after clicking “View items,” creating unnecessary friction in a high-intent moment.",
      },
      {
        id: "user-perception",
        alt: "User point of view — users' perception: when a website loads quickly, users perceive it as responsive and easy to use; when it takes too long, they perceive it as slow and unresponsive, negatively impacting their overall experience.",
      },
      {
        id: "goal",
        alt: "Goal: 10 seconds is good enough, so users can freely use the website without worrying about being slowed down by the computer.",
      },
      {
        id: "usability-issue",
        alt: "Usability issue: needs clearer user feedback. When users click “View items,” the interface should provide immediate feedback, such as a loading spinner, since the next page can sometimes take up to 15 seconds to load.",
      },
      {
        id: "closing",
        alt: "Closing slide: “Could we be more than a flyby?” — signed Tamires Lelis.",
      },
    ],
  },
];

export const getCaseById = (id: string | null): CaseStudy | undefined =>
  id ? cases.find((c) => c.id === id) : undefined;
