interface RuinInstance {
  position: [number, number, number];
  rotationY: number;
  scale: [number, number, number];
}

// A handful of abstract "dormant structure" primitives, sparse and
// partly fog-swallowed at mid-distance — deliberately few and deliberately
// abstract (boxes, not anything readable as a specific building) so the
// space still reads as open. Real geometry/materials arrive in a later
// pass once there's visual reference to iterate against; this is honestly
// a placeholder, not a finished environment.
const RUINS: RuinInstance[] = [
  { position: [-7, 1.5, -6], rotationY: 0.3, scale: [1, 3, 1] },
  { position: [6, 1, -10], rotationY: -0.6, scale: [1.4, 2, 1.4] },
  { position: [-3, 2, -13], rotationY: 1.1, scale: [0.8, 4, 0.8] },
];

const GROUND_SIZE = 60;

/**
 * The placeholder world's ground, sky, fog, and a few abstract "dormant
 * structure" markers — primitives and flat color only, no textures. Fog
 * does most of the atmospheric work here (a cheap way to hide the lack of
 * detail at distance) rather than any per-frame or shader cost.
 */
export function SceneEnvironment() {
  return (
    <>
      {/* The background color intentionally matches the fog color exactly
          — fog only tints geometry, never the empty background on its
          own, so a mismatched pair leaves a visible seam where the fogged
          ground meets the "sky" at the horizon. */}
      <color attach="background" args={["#3c6b63"]} />
      <fog attach="fog" args={["#3c6b63", 8, 34]} />

      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial color="#33564a" roughness={1} />
      </mesh>

      {RUINS.map((ruin) => (
        <mesh key={ruin.position.join(",")} position={ruin.position} rotation-y={ruin.rotationY} castShadow receiveShadow>
          <boxGeometry args={ruin.scale} />
          <meshStandardMaterial color="#5b6b74" roughness={0.85} />
        </mesh>
      ))}
    </>
  );
}
