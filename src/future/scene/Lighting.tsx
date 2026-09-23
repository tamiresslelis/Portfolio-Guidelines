/**
 * A dim, cool moonlit "sun" paired with a dark hemisphere fill — moody
 * and nocturnal rather than bright daylight, matching the dark-forest
 * reference (a near-black backdrop with light doing selective, delicate
 * work — the landmark's own glow and the blossom accents — rather than
 * an even, bright exposure). Still just one shadow-casting light + one
 * non-shadow fill, on purpose (see the performance notes on dynamic
 * lights being one of the more expensive things to add casually).
 */
export function Lighting() {
  return (
    <>
      <directionalLight
        position={[8, 10, 4]}
        intensity={0.85}
        color="#cfd9c8"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight args={["#1c2a1e", "#0a100c", 0.55]} />
    </>
  );
}
