/**
 * Resume content. Bullet/summary strings use a tiny `**bold**` markdown-lite
 * convention, rendered by `renderRichText` in `ResumeWindow.tsx` — enough to
 * highlight stats and product names without pulling in a markdown parser.
 */

export interface ExperienceEntry {
  company: string;
  role: string;
  dates: string;
  summary: string;
  bullets: string[];
}

export interface ResumeData {
  name: string;
  title: string;
  summary: string;
  stats: string;
  productImpact: string[];
  expertise: string[];
  experience: ExperienceEntry[];
  education: string[];
}

export const resume: ResumeData = {
  name: "Tamires Lelis",
  title: "Senior Product Designer",
  summary:
    "Senior Product Designer with 10 years of experience building digital products, including 8 years in Product Design and 2 years in front-end development. I simplify complex products across fintech, healthcare, enterprise SaaS, and AI, working closely with Product and Engineering to turn business rules, technical constraints, and user needs into clear, scalable web and mobile experiences. My background spans large-scale financial institutions including Itaú Unibanco and CAIXA, as well as international tech companies, with a strong focus on usability, design systems, and measurable product outcomes.",
  stats:
    "226% user growth · 14% activation uplift · 44% lower onboarding drop-off · 200K+ responses reused · investor support during ~$7M raise",
  productImpact: [
    "**Insense — Creator Activation:** Reduced creator onboarding drop-off from **32% to 18%** and increased activation by **14%** by redesigning the onboarding journey, clarifying requirements, and improving contextual guidance.",
    "**Insense — AI Product Innovation:** Independently designed and built **Project Atlas**, a Gemini-powered mobile prototype, in four weeks, generating scored and actionable UGC compliance reports in **under three minutes** during testing.",
    "**BeCareLink — Healthtech:** Led end-to-end product design as the first and sole designer for the BeCare MS Link platform, contributing to active-user growth from **1,900 to 6,200 in 12 months (+226%)** and creating product narratives and investor-facing materials used during fundraising efforts as the company raised **~$7M**.",
    "**Unisys / CAIXA — Enterprise B2B:** Improved CIWEB, a real-estate credit system used by **86,400+ CAIXA employees**, reducing workflow confusion and reliance on internal support.",
  ],
  expertise: [
    "Complex Systems & Enterprise SaaS",
    "AI-Powered Workflows",
    "Product Strategy & Discovery",
    "Fintech & Healthcare",
    "Design Systems & Scalable UI",
    "Product Analytics",
    "Rapid Prototyping",
    "Product & Engineering Collaboration",
  ],
  experience: [
    {
      company: "Insense",
      role: "Senior Product Designer",
      dates: "Oct 2024 - Present",
      summary:
        "Drove end-to-end product design across web and mobile for a two-sided SaaS marketplace connecting brands and creators for UGC and influencer marketing.",
      bullets: [
        "Reduced creator onboarding drop-off from **32% to 18%** and increased activation by **14%** by redesigning key activation steps, clarifying requirements, and improving contextual guidance.",
        "Designed and built **Project Atlas**, an AI-assisted UGC review prototype using **React Native, TypeScript, Google AI Studio, Gemini API, and VS Code** to pre-check multimodal creator content before brand review, turning a manual review step into an AI-assisted workflow designed to reduce the time brands spend evaluating each creative.",
        "Improved campaign workflows across both sides of the marketplace: created a reusable-answer system generating **200K+ reused responses** with a **90%+ completion rate**, and designed a brand campaign dashboard surfacing campaigns requiring action. Created its scalable table component and added it to the **company design system for reuse across the SaaS platform**.",
        "Increased successful **Instagram and TikTok account connections from 47.5% to 51%** by clarifying the value proposition, strengthening CTA hierarchy, and giving creators greater control over the connection flow.",
      ],
    },
    {
      company: "BeCareLink",
      role: "Senior Product Designer",
      dates: "May 2022 - Sep 2024",
      summary:
        "Led end-to-end product design across four HIPAA-compliant healthcare SaaS platforms, partnering with founders and physicians on product strategy and delivery.",
      bullets: [
        "Defined **product requirements, user stories, roadmaps, and prioritization** across four healthcare products, shaping product development and launch decisions directly with founders.",
        "Increased active users from **1.9K to 6.2K in 12 months (+226%)** by improving onboarding, activation, retention, and behavior-triggered engagement.",
        "Built a reusable **design system and component library**, supporting the launch of **BeCare Camp Lejeune in 3 months** for a potential audience of **~1M military personnel and family members**.",
        "Established the product analytics foundation using **Firebase**, defining event tracking and behavioral metrics to support data-informed prioritization and continuous product optimization.",
      ],
    },
    {
      company: "Itaú",
      role: "Senior Product Designer",
      dates: "Jun 2021 - May 2022",
      summary:
        "Consulted on end-to-end UX initiatives for Itaú Corporate across mobile and desktop banking within Itaú Unibanco's ecosystem, serving 66 million clients globally, including Itaú BBA.",
      bullets: [
        "Led the **mobile foreign-currency experience** across send, request, and withdrawal flows, translating customer needs into a simpler mobile journey.",
        "Conducted **user interviews, competitive analysis, and usability testing** to identify friction, validate solutions, and inform product decisions.",
        "Used **~1,000 daily foreign-currency transactions** on Bankline as a behavioral baseline to define and measure mobile adoption KPIs.",
        "Defined **user states, edge cases, and acceptance criteria using BDD-style scenarios**, reducing ambiguity across Product, Engineering, and QA.",
      ],
    },
    {
      company: "Accenture",
      role: "Product Designer",
      dates: "Feb 2020 - Feb 2021",
      summary:
        "Designed digital banking experiences for Bank of Communications (BOCOM BBM) within a high-volume, regulated legacy ecosystem.",
      bullets: [
        "Simplified **complex banking workflows** and business rules into clear user flows and interaction patterns.",
        "Created **high-fidelity prototypes** and developer-ready specifications for Agile delivery.",
      ],
    },
    {
      company: "Unisys",
      role: "UX/UI Developer",
      dates: "Mar 2018 - Jan 2020",
      summary:
        "Worked on CIWEB, a large-scale B2B real estate credit platform within CAIXA's 84K+ employee ecosystem in Brazil, at a bank serving 156M+ customers nationwide.",
      bullets: [
        "Led **UX/UI improvements for CIWEB**, simplifying complex real estate credit workflows used across CAIXA's large-scale internal banking ecosystem.",
        "Redesigned information architecture and interaction patterns to **reduce user confusion and improve navigation** across complex B2B financial workflows.",
        "Improved the experience of **Portal das Construtoras**, a B2B platform serving **3,000+ construction companies**, translating complex business and operational requirements into clearer user journeys.",
        "Bridged **design and engineering** by implementing interfaces with **Angular, HTML, and CSS**, translating high-fidelity designs into functional front-end experiences.",
      ],
    },
  ],
  education: [
    "Bachelor of Computer Engineering (2011-2017) — Federal Center for Technological Education of Minas Gerais",
    "Kanban System Design (KPM I) — Kanban University",
  ],
};
