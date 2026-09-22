import { useFrame } from "@react-three/fiber";
import { MathUtils, Vector3, type Group } from "three";
import { usePlayerMovement } from "../hooks/usePlayerMovement";
import { usePointAndClickTarget } from "../hooks/usePointAndClickTarget";
import { PLAYER_SPEED, PLAYER_RUN_MULTIPLIER, WORLD_BOUNDS, CLICK_TARGET_ARRIVAL_DISTANCE } from "../constants";
import { getTerrainHeight } from "../utils/terrain";

interface PlayerProps {
  /** Shared with `CameraController` so it can follow this exact Object3D
   *  without React state — see FutureScene.tsx for why a plain ref
   *  (rather than a store) is enough at this scale. */
  playerRef: React.RefObject<Group | null>;
  /** False while a project overlay is open — the player shouldn't wander
   *  around a dimmed world behind a modal. */
  movementEnabled: boolean;
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
 *
 * Two input sources feed the same movement, so a recruiter never *needs*
 * to know WASD exists: held keyboard input (see `usePlayerMovement`)
 * takes priority and clears any pending click-to-move target; otherwise,
 * a clicked ground point (see `usePointAndClickTarget`) is walked toward
 * until reached.
 */
export function Player({ playerRef, movementEnabled }: PlayerProps) {
  const inputRef = usePlayerMovement();
  const clickTargetRef = usePointAndClickTarget(movementEnabled);

  useFrame((_, delta) => {
    const player = playerRef.current;
    if (!player) return;

    if (movementEnabled) {
      const input = inputRef.current;

      moveDirection.set(0, 0, 0);
      if (input.forward) moveDirection.z -= 1;
      if (input.backward) moveDirection.z += 1;
      if (input.left) moveDirection.x -= 1;
      if (input.right) moveDirection.x += 1;

      const hasKeyboardInput = moveDirection.lengthSq() > 0;
      let shouldMove = true;
      if (hasKeyboardInput) {
        // Keyboard input always wins over a pending click target.
        clickTargetRef.current = null;
        moveDirection.normalize();
      } else if (clickTargetRef.current) {
        moveDirection.copy(clickTargetRef.current).sub(player.position);
        moveDirection.y = 0;
        const distanceToTarget = moveDirection.length();
        if (distanceToTarget <= CLICK_TARGET_ARRIVAL_DISTANCE) {
          clickTargetRef.current = null;
          shouldMove = false;
        } else {
          moveDirection.normalize();
        }
      } else {
        shouldMove = false;
      }

      if (shouldMove) {
        const speed = PLAYER_SPEED * (input.run ? PLAYER_RUN_MULTIPLIER : 1);
        player.position.x += moveDirection.x * speed * delta;
        player.position.z += moveDirection.z * speed * delta;
        player.position.x = MathUtils.clamp(player.position.x, -WORLD_BOUNDS.x, WORLD_BOUNDS.x);
        player.position.z = MathUtils.clamp(player.position.z, -WORLD_BOUNDS.z, WORLD_BOUNDS.z);

        const targetHeading = Math.atan2(moveDirection.x, moveDirection.z);
        player.rotation.y = MathUtils.lerp(player.rotation.y, targetHeading, 0.2);
      }
    }

    // Always kept in sync with the ground's own displacement (even while
    // standing still, or while movement is disabled) so the player never
    // floats above or clips into the undulating terrain.
    player.position.y = getTerrainHeight(player.position.x, player.position.z);
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
