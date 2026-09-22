import { Sparkles } from "@react-three/drei";

/**
 * A small, restrained drift of warm motes — "subtle particles", not a
 * particle-effects showcase. Uses drei's built-in `<Sparkles>` rather
 * than a hand-rolled GPU particle system: it already exists in a
 * dependency this project takes on anyway, and a custom system wouldn't
 * buy anything at this scale (a low, fixed count, no per-frame React
 * involvement either way).
 */
export function Particles() {
  return <Sparkles count={40} scale={[20, 6, 20]} size={2} speed={0.15} opacity={0.35} color="#f2d98a" />;
}
