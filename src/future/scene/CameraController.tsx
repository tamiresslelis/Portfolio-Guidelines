import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import { CAMERA_OFFSET, CAMERA_POSITION_DAMPING, CAMERA_LOOKAT_DAMPING } from "../constants";

interface CameraControllerProps {
  playerRef: React.RefObject<Group | null>;
}

// Scratch vectors reused every frame — never reallocated inside useFrame.
const desiredPosition = new Vector3();
const desiredLookAt = new Vector3();
const cameraOffset = new Vector3(...CAMERA_OFFSET);
const lookAtHeightOffset = new Vector3(0, 1.2, 0);

/**
 * A damped third-person follow camera: eases toward a position offset
 * behind the player (rotated with them) and a look-at point just above
 * their head, using exponential ("1 - e^-k·dt") damping rather than a
 * fixed lerp factor — frame-rate independent, so it eases at the same
 * *speed* whether the browser is at 30fps or 144fps, not just the same
 * number of steps. Deliberately gentle (see the damping constants) so it
 * reads as calm and premium rather than a fast action-game camera.
 *
 * No collision awareness yet — there's nothing in this placeholder world
 * for the camera to clip through. Add it once real geometry exists to
 * occlude against.
 */
export function CameraController({ playerRef }: CameraControllerProps) {
  const { camera } = useThree();
  const currentLookAt = useRef(new Vector3(0, 1.2, 10));

  useFrame((_, delta) => {
    const player = playerRef.current;
    if (!player) return;

    desiredPosition.copy(cameraOffset).applyQuaternion(player.quaternion).add(player.position);
    camera.position.lerp(desiredPosition, 1 - Math.exp(-CAMERA_POSITION_DAMPING * delta));

    desiredLookAt.copy(player.position).add(lookAtHeightOffset);
    currentLookAt.current.lerp(desiredLookAt, 1 - Math.exp(-CAMERA_LOOKAT_DAMPING * delta));
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
