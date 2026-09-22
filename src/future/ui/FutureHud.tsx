interface FutureHudProps {
  onExit: () => void;
}

/**
 * The only DOM chrome layered over the canvas: a title, an always-visible
 * way back to the 2011 portfolio, and a one-line controls hint —
 * deliberately restrained rather than a generic game HUD (health bars,
 * minimaps, etc.), matching "this is still a design portfolio" over
 * "this is a game." Career content itself never lives in here — see the
 * (future) accessible career timeline for where that belongs instead.
 */
export function FutureHud({ onExit }: FutureHudProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 font-sans sm:p-6">
      <div className="flex items-start justify-between">
        <div className="pointer-events-none">
          <p className="m-0 text-sm font-medium tracking-wide text-white/90">Tamires Lelis</p>
          <p className="m-0 text-xs text-white/60">2026 — Career Journey (preview)</p>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="pointer-events-auto rounded-sm border border-white/25 bg-black/30 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm hover:bg-black/50 focus-visible:bg-black/50"
        >
          Exit to 2011
        </button>
      </div>

      <p className="pointer-events-none m-0 self-start text-xs text-white/60">WASD or arrow keys to move</p>
    </div>
  );
}
