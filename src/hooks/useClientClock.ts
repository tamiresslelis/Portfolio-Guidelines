import { useEffect, useState } from "react";

const TIME_ZONE = "America/Sao_Paulo";

// A "HH:MM" display only ever changes once a minute — polling every 15s
// keeps it visibly accurate without re-rendering on every single second.
const UPDATE_INTERVAL_MS = 15_000;

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
});

/**
 * The current time in Florianópolis (`America/Sao_Paulo`), as "HH:MM",
 * refreshed automatically while mounted. Returns `null` until the first
 * client-side effect runs: this app is server-prerendered, the server has
 * no meaningful "now" for a visitor's clock, and rendering a real value
 * during that prerender would almost certainly mismatch whatever the
 * browser computes on hydration. Effects never run during SSR, so both
 * the server output and the client's first render agree on `null` —
 * callers should render a static placeholder for that case, then let this
 * hook fill in the real time right after mount.
 */
export function useClientClock(): string | null {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(timeFormatter.format(new Date()));
    update();
    const intervalId = window.setInterval(update, UPDATE_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  return time;
}
