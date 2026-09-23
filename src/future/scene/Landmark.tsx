import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import type { ProjectLandmark } from "../types/career";
import { LANDMARK_INTERACTION_RADIUS } from "../constants";
import { groundPosition } from "../utils/terrain";

interface LandmarkProps {
  landmark: ProjectLandmark;
  playerRef: React.RefObject<Group | null>;
  /** Called only when proximity actually crosses the threshold — not
   *  every frame — so the DOM interaction prompt (owned outside the
   *  canvas, by FuturePortfolio) can react via ordinary React state
   *  without this component causing 60 renders/second. */
  onProximityChange: (id: string, isNear: boolean) => void;
}

const landmarkGroundPosition = new Vector3();
const playerGroundPosition = new Vector3();

/**
 * One project destination: a small "hub" structure (a raised platform, a
 * glowing spire, two flanking light pillars) rather than a floating UI
 * card — see the visual-direction notes on treating each project as an
 * architectural destination. Purely visual composition; the actual
 * project content lives in `ProjectOverlay`, opened from outside the
 * canvas once the player interacts while near.
 */
export function Landmark({ landmark, playerRef, onProximityChange }: LandmarkProps) {
  const isNearRef = useRef(false);
  const groundedPosition = groundPosition(landmark.position);

  useFrame(() => {
    const player = playerRef.current;
    if (!player) return;

    // Horizontal distance only — interaction range shouldn't be affected
    // by the ground's own small undulation.
    playerGroundPosition.set(player.position.x, 0, player.position.z);
    landmarkGroundPosition.set(landmark.position[0], 0, landmark.position[2]);
    const distance = playerGroundPosition.distanceTo(landmarkGroundPosition);
    const isNear = distance <= LANDMARK_INTERACTION_RADIUS;
    if (isNear !== isNearRef.current) {
      isNearRef.current = isNear;
      onProximityChange(landmark.id, isNear);
    }
  });

  return (
    <group position={groundedPosition}>
      {/* Dark, mossy platform — the glow above reads as light against
          dark rather than metal-against-daylight, matching the reference's
          "technology accent against dark, organic surroundings". */}
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3, 3.4, 0.3, 24]} />
        <meshStandardMaterial color="#1c2417" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2, 0]} castShadow>
        <coneGeometry args={[1.6, 3, 6]} />
        <meshStandardMaterial color="#e0b23c" emissive="#e0b23c" emissiveIntensity={0.5} roughness={0.4} />
      </mesh>
      {[-2.1, 2.1].map((x) => (
        <mesh key={x} position={[x, 1.2, 1.6]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 2.4, 8]} />
          <meshStandardMaterial color="#8fc4ff" emissive="#8fc4ff" emissiveIntensity={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}
