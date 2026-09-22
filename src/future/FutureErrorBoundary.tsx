import { Component, type ReactNode } from "react";

interface FutureErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface FutureErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches WebGL/Three.js init failures so they render `fallback` (see
 * `FutureErrorFallback.tsx`) instead of taking down the page — React only
 * offers this via a class component; there's no hook equivalent.
 */
export class FutureErrorBoundary extends Component<FutureErrorBoundaryProps, FutureErrorBoundaryState> {
  state: FutureErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): FutureErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    // Not rethrown — `fallback` is the intended, tested recovery path for
    // this failure mode, not an unexpected crash to surface loudly.
    console.error("Future experience failed to render:", error);
  }

  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
