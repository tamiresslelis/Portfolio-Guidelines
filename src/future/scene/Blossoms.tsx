import { Instances, Instance } from "@react-three/drei";

interface BlossomCluster {
  center: [number, number, number];
  count: number;
}

// A handful of small white "blossom" clusters scattered near the
// landmark and path — a delicate accent against the dark moss (per the
// visual reference), not a meadow of flowers. Fixed, deterministic
// offsets from a few hand-picked cluster centers rather than randomly
// seeded per load.
const CLUSTERS: BlossomCluster[] = [
  { center: [-2, 0.35, -10], count: 5 },
  { center: [3, 0.3, -8], count: 4 },
  { center: [-8, 0.3, 2], count: 4 },
  { center: [8, 0.3, 4], count: 5 },
  { center: [1.5, 0.3, 5], count: 3 },
];

const CLUSTER_OFFSETS: [number, number][] = [
  [0, 0],
  [0.16, 0.08],
  [-0.14, 0.11],
  [0.09, -0.16],
  [-0.17, -0.08],
];

/** Small, faintly luminous white "flower" clusters — a soft accent
 *  against the dark moss, matching the reference's delicate bloom
 *  motif. One instanced draw call regardless of cluster count. */
export function Blossoms() {
  const positions: [number, number, number][] = [];
  for (const cluster of CLUSTERS) {
    for (let i = 0; i < cluster.count; i++) {
      const [dx, dz] = CLUSTER_OFFSETS[i % CLUSTER_OFFSETS.length];
      positions.push([cluster.center[0] + dx, cluster.center[1], cluster.center[2] + dz]);
    }
  }

  return (
    <Instances limit={positions.length}>
      <sphereGeometry args={[0.07, 6, 6]} />
      <meshStandardMaterial color="#f5f2e6" emissive="#f5f2e6" emissiveIntensity={0.18} roughness={0.6} />
      {positions.map((position, index) => (
        <Instance key={index} position={position} />
      ))}
    </Instances>
  );
}
