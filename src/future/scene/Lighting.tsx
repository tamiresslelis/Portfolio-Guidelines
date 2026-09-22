/**
 * Warm low-angle "sun" (directional) paired with a cool teal/near-black
 * hemisphere fill — that warm/cool contrast is the whole lighting
 * signature for this world. One shadow-casting light, one non-shadow
 * fill: no more real-time lights than that, on purpose (see the
 * performance strategy — dynamic lights are one of the more expensive
 * things to add casually).
 */
export function Lighting() {
  return (
    <>
      <directionalLight
        position={[8, 10, 4]}
        intensity={1.4}
        color="#f3c67a"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight args={["#2d7d72", "#0c1a18", 0.6]} />
    </>
  );
}
