import { Sparkles } from "@react-three/drei";

/**
 * Two restrained drifts, not a particle-effects showcase, both via
 * drei's built-in `<Sparkles>` rather than a hand-rolled GPU particle
 * system (it already exists in a dependency this project takes on
 * anyway, and a custom system wouldn't buy anything at this low, fixed
 * count): a warm ground-level dust drift near where the player actually
 * walks, and a cooler, more numerous, mostly-static speckle spread high
 * and wide — the dark, speckled backdrop from the visual reference,
 * rather than an empty flat sky.
 */
export function Particles() {
  return (
    <>
      <Sparkles count={30} scale={[20, 5, 20]} size={1.8} speed={0.15} opacity={0.3} color="#f2d98a" />
      <Sparkles count={80} scale={[50, 22, 50]} position={[0, 6, -6]} size={1} speed={0.03} opacity={0.5} color="#dfe8e0" />
    </>
  );
}
