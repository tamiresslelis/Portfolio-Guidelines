/** Must match the displacement `SceneEnvironment` bakes into the ground
 *  geometry — kept as one shared function so the player and landmarks can
 *  sit *on* the undulating ground instead of floating above or clipping
 *  into it at a fixed y=0. A cheap, deterministic ripple, not real noise;
 *  see SceneEnvironment.tsx for why that's the right amount of effort for
 *  a placeholder pass. */
const TERRAIN_UNDULATION_HEIGHT = 0.35;

export function getTerrainHeight(x: number, z: number): number {
  return Math.sin(x * 0.18) * Math.cos(z * 0.15) * TERRAIN_UNDULATION_HEIGHT;
}

/** An authored `[x, y, z]` position (typically authored with y=0), resting
 *  on the ground's own undulation instead of floating above/clipping
 *  into it. */
export function groundPosition(position: [number, number, number]): [number, number, number] {
  const [x, y, z] = position;
  return [x, y + getTerrainHeight(x, z), z];
}
