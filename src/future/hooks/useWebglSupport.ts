import { useEffect, useState } from "react";

function detectWebglSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Whether this browser can render WebGL — `null` until the first client
 * -side check runs (same hydration-safe shape as `useClientClock`: there's
 * nothing meaningful to check during the server prerender, and `Canvas`
 * -related APIs don't exist in that environment anyway).
 */
export function useWebglSupport(): boolean | null {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setIsSupported(detectWebglSupport());
  }, []);

  return isSupported;
}
