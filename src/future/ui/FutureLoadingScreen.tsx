import { useProgress } from "@react-three/drei";

/**
 * Shown while real 3D assets (textures, GLTF models) load — currently
 * near-instant, since this placeholder world only uses primitive
 * geometry. Kept in place (rather than skipped) so the loading
 * architecture is already correct once Phase 4/5 adds real assets to
 * track. Visually continues the evolution transition's "arrival" beat
 * (dark background, soft warm glow) rather than introducing a new look.
 */
export function FutureLoadingScreen() {
  const { active, progress } = useProgress();

  if (!active) return null;

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#04100e] font-sans"
      role="status"
      aria-live="polite"
    >
      <div
        className="h-16 w-16 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(224,178,60,0.4) 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <p className="m-0 text-xs tracking-[2px] text-[#f2d98a] uppercase">Building the world — {Math.round(progress)}%</p>
    </div>
  );
}
