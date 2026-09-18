interface XpClockProps {
  /** Formatted "HH:MM", or `null` before the client clock has mounted —
   *  see `useClientClock` for why that placeholder window exists. */
  time: string | null;
}

/**
 * The flag + time readout inside the system tray. Purely presentational —
 * `XpSystemTray` owns the live clock value and the accessible name on the
 * button wrapping this, so everything here is `aria-hidden`.
 */
export function XpClock({ time }: XpClockProps) {
  return (
    <span className="flex items-center gap-1.5" aria-hidden="true">
      <span>🇧🇷</span>
      <span className="tabular-nums">{time ?? "--:--"}</span>
    </span>
  );
}
