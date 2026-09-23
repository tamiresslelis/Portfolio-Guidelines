import { Instances, Instance } from "@react-three/drei";

interface TreeInstance {
  position: [number, number, number];
  scale: number;
}

// Fixed, hand-placed positions rather than randomly scattered — a
// deterministic scene is easier to reason about and screenshot-test than
// one seeded by Math.random() on every reload. A modest count (foreground
// + midground layering, per the visual-direction notes) rendered through
// one instanced draw call each for the trunk and the canopy, regardless
// of how many trees there are.
const TREES: TreeInstance[] = [
  { position: [-9, 0, 4], scale: 1.1 },
  { position: [-11, 0, -2], scale: 0.9 },
  { position: [9, 0, 6], scale: 1 },
  { position: [11, 0, -1], scale: 1.2 },
  { position: [-6, 0, 10], scale: 0.8 },
  { position: [7, 0, 12], scale: 0.95 },
  { position: [-13, 0, -9], scale: 1.05 },
  { position: [13, 0, -11], scale: 0.85 },
];

/**
 * Simple cone-and-cylinder trees, instanced (one draw call for all trunks,
 * one for all canopies regardless of tree count) rather than one mesh per
 * tree — "instancing where useful" from the performance notes, applied to
 * the one genuinely-repeated asset in this scene.
 */
export function Vegetation() {
  return (
    <>
      <Instances limit={TREES.length} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 1.6, 6]} />
        <meshStandardMaterial color="#2b1f14" roughness={0.95} />
        {TREES.map((tree) => (
          <Instance
            key={tree.position.join(",")}
            position={[tree.position[0], 0.8 * tree.scale, tree.position[2]]}
            scale={tree.scale}
          />
        ))}
      </Instances>
      <Instances limit={TREES.length} castShadow>
        <coneGeometry args={[1.1, 2.2, 8]} />
        <meshStandardMaterial color="#38452a" roughness={0.9} />
        {TREES.map((tree) => (
          <Instance
            key={tree.position.join(",")}
            position={[tree.position[0], 2.2 * tree.scale, tree.position[2]]}
            scale={tree.scale}
          />
        ))}
      </Instances>
    </>
  );
}
