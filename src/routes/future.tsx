import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useCallback } from "react";
import { FutureChunkLoadingScreen } from "../components/FutureChunkLoadingScreen";

// See src/future/FuturePortfolio.tsx's own doc comment: Three.js/R3F/drei
// cannot run under Node (this app is server-prerendered), and even if they
// could, shipping them in the same bundle as the 2011 portfolio would
// regress its load time for every visitor who never opens this route.
// `lazy()` defers the real `import()` until this component actually
// renders on the client, keeping this entire dependency tree out of both
// the prerendered "/" page and this route's own initial evaluation.
const FuturePortfolio = lazy(() => import("../future/FuturePortfolio"));

export const Route = createFileRoute("/future")({
  head: () => ({
    meta: [
      { title: "Tamires Lelis — 2026 Career Journey" },
      {
        name: "description",
        content: "An interactive 3D preview of Tamires Lelis's career journey into 2026.",
      },
    ],
  }),
  component: FutureRoute,
});

function FutureRoute() {
  const navigate = useNavigate();

  const handleExit = useCallback(() => {
    void navigate({ to: "/" });
  }, [navigate]);

  // Hands off to the real case-study viewer already built for the 2011
  // side, rather than re-implementing case-study reading inside this
  // route — routes/index.tsx reads this same `case` search param and
  // opens the matching CaseWindow.
  const handleOpenCaseStudy = useCallback(
    (caseStudyId: string) => {
      void navigate({ to: "/", search: { case: caseStudyId } });
    },
    [navigate],
  );

  return (
    <Suspense fallback={<FutureChunkLoadingScreen />}>
      <FuturePortfolio onExit={handleExit} onOpenCaseStudy={handleOpenCaseStudy} />
    </Suspense>
  );
}
