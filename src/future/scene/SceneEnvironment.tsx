import { useMemo } from "react";
import { PlaneGeometry } from "three";
import { getTerrainHeight } from "../utils/terrain";

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

// A dark, moody near-black-green rather than the earlier bright teal —
// matching the moss-and-night-forest reference (dark backdrop, cool
// desaturated moss, delicate light accents doing the work instead of a
// bright overall exposure).
const BACKGROUND_COLOR = "#141910";
const FOG_COLOR = "#181f16";
const GROUND_COLOR = "#333f24";
const RUIN_COLOR = "#37423a";

const GROUND_SIZE = 60;
const GROUND_SEGMENTS = 48;

/** Displaces the (as-yet-unrotated) plane's local Z axis, which becomes
 *  world-space "up" once the mesh is rotated flat — see `getTerrainHeight`
 *  for the actual height function, shared with the player/landmarks so
 *  they sit *on* this surface instead of floating above or clipping into
 *  it. Computed once and reused for the geometry's lifetime, not touched
 *  per frame. */
function createUndulatingGround(): PlaneGeometry {
  const geometry = new PlaneGeometry(GROUND_SIZE, GROUND_SIZE, GROUND_SEGMENTS, GROUND_SEGMENTS);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    position.setZ(i, getTerrainHeight(x, y));
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * The placeholder world's ground, sky, fog, and a few abstract "dormant
 * structure" markers — primitives and flat color only, no textures. Fog
 * does most of the atmospheric work here (a cheap way to hide the lack of
 * detail at distance) rather than any per-frame or shader cost.
 */
export function SceneEnvironment() {
  const groundGeometry = useMemo(() => createUndulatingGround(), []);

  return (
    <>
      {/* The background color intentionally matches the fog color closely
          — fog only tints geometry, never the empty background on its
          own, so a mismatched pair leaves a visible seam where the fogged
          ground meets the "sky" at the horizon. */}
      <color attach="background" args={[BACKGROUND_COLOR]} />
      {/* far=52 rather than the ground's own ~34-unit visible radius:
          Mountains.tsx places its silhouettes around z=-28..-34
          specifically to read as background *through* haze, not be fully
          fogged into invisibility — a mismatched pair here would defeat
          the whole point of having them. */}
      <fog attach="fog" args={[FOG_COLOR, 8, 52]} />

      <mesh geometry={groundGeometry} rotation-x={-Math.PI / 2} receiveShadow>
        <meshStandardMaterial color={GROUND_COLOR} roughness={1} />
      </mesh>

      {RUINS.map((ruin) => (
        <mesh key={ruin.position.join(",")} position={ruin.position} rotation-y={ruin.rotationY} castShadow receiveShadow>
          <boxGeometry args={ruin.scale} />
          <meshStandardMaterial color={RUIN_COLOR} roughness={0.9} />
        </mesh>
      ))}
    </>
  );
}
