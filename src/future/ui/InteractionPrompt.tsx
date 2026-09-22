interface InteractionPromptProps {
  label: string;
}

/**
 * "Press E to explore" — deliberately small and understated (a pill, not
 * a big game-HUD banner), and paired with a mouse-click hint so a
 * recruiter who's never touched WASD still has an obvious next action.
 */
export function InteractionPrompt({ label }: InteractionPromptProps) {
  return (
    <div
      className="pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2 animate-xp-fade-in font-sans motion-reduce:animate-none"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-4 py-2 backdrop-blur-sm">
        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[3px] border border-white/40 bg-white/10 text-[11px] font-bold text-white">
          E
        </span>
        <span className="text-xs font-medium whitespace-nowrap text-white/90">{label}</span>
        <span className="text-[11px] text-white/50">or click to walk closer</span>
      </div>
    </div>
  );
}
