import { useFrame } from "@react-three/fiber";
import { MathUtils, Vector3, type Group } from "three";
import { usePlayerMovement } from "../hooks/usePlayerMovement";
import { PLAYER_SPEED, WORLD_BOUNDS } from "../constants";

interface PlayerProps {
  /** Shared with `CameraController` so it can follow this exact Object3D
   *  without React state — see FutureScene.tsx for why a plain ref
   *  (rather than a store) is enough at this scale. */
  playerRef: React.RefObject<Group | null>;
}

// A scratch vector reused every frame instead of allocated fresh each time.
const moveDirection = new Vector3();

/**
 * A placeholder capsule standing in for the real avatar (see the
 * architecture notes: replacing this with a GLTF character later shouldn't
 * require touching the movement logic below). Movement is computed
 * entirely inside `useFrame`, mutating the group's `position`/`rotation`
 * directly — never through `setState`, so walking never triggers a React
 * re-render.
 */
export function Player({ playerRef }: PlayerProps) {
  const inputRef = usePlayerMovement();

  useFrame((_, delta) => {
    const player = playerRef.current;
    if (!player) return;
    const input = inputRef.current;

    moveDirection.set(0, 0, 0);
    if (input.forward) moveDirection.z -= 1;
    if (input.backward) moveDirection.z += 1;
    if (input.left) moveDirection.x -= 1;
    if (input.right) moveDirection.x += 1;

    if (moveDirection.lengthSq() === 0) return;
    moveDirection.normalize();

    player.position.x += moveDirection.x * PLAYER_SPEED * delta;
    player.position.z += moveDirection.z * PLAYER_SPEED * delta;
    player.position.x = MathUtils.clamp(player.position.x, -WORLD_BOUNDS.x, WORLD_BOUNDS.x);
    player.position.z = MathUtils.clamp(player.position.z, -WORLD_BOUNDS.z, WORLD_BOUNDS.z);

    const targetHeading = Math.atan2(moveDirection.x, moveDirection.z);
    player.rotation.y = MathUtils.lerp(player.rotation.y, targetHeading, 0.2);
  });

  return (
    <group ref={playerRef} position={[0, 0, 10]}>
      <mesh castShadow position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.4, 1.1, 4, 8]} />
        <meshStandardMaterial color="#e0b23c" roughness={0.5} metalness={0.1} />
      </mesh>
    </group>
  );
}
