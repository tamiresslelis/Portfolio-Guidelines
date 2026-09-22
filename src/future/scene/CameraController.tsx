import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import {
  CAMERA_OFFSET,
  CAMERA_FOCUS_OFFSET,
  CAMERA_POSITION_DAMPING,
  CAMERA_LOOKAT_DAMPING,
} from "../constants";

interface CameraControllerProps {
  playerRef: React.RefObject<Group | null>;
  /** A landmark's position while its project overlay is open — switches
   *  the camera from following the player to a fixed cinematic framing of
   *  that landmark instead. `null` returns it to following the player. */
  focusPosition: [number, number, number] | null;
}

// Scratch vectors reused every frame — never reallocated inside useFrame.
const desiredPosition = new Vector3();
const desiredLookAt = new Vector3();
const followOffset = new Vector3(...CAMERA_OFFSET);
const focusOffset = new Vector3(...CAMERA_FOCUS_OFFSET);
const lookAtHeightOffset = new Vector3(0, 1.2, 0);
const landmarkLookAtHeightOffset = new Vector3(0, 1.5, 0);

/**
 * A damped third-person follow camera: eases toward a position offset
 * behind the player (rotated with them) and a look-at point just above
 * their head, using exponential ("1 - e^-k·dt") damping rather than a
 * fixed lerp factor — frame-rate independent, so it eases at the same
 * *speed* whether the browser is at 30fps or 144fps, not just the same
 * number of steps. Deliberately gentle (see the damping constants) so it
 * reads as calm and premium rather than a fast action-game camera.
 *
 * While `focusPosition` is set (a project overlay is open), the same
 * damping eases the camera toward a fixed cinematic framing of that
 * landmark instead of following the player — "approaching a landmark
 * transitions from exploration camera to cinematic focus" — rather than
 * a hard cut.
 *
 * No collision awareness yet — there's nothing in this placeholder world
 * dense enough for the camera to clip through. Add it once real geometry
 * exists to occlude against.
 */
export function CameraController({ playerRef, focusPosition }: CameraControllerProps) {
  const { camera } = useThree();
  const currentLookAt = useRef(new Vector3(0, 1.2, 10));

  useFrame((_, delta) => {
    const player = playerRef.current;
    if (!player) return;

    const positionAlpha = 1 - Math.exp(-CAMERA_POSITION_DAMPING * delta);
    const lookAtAlpha = 1 - Math.exp(-CAMERA_LOOKAT_DAMPING * delta);

    if (focusPosition) {
      desiredPosition.set(...focusPosition).add(focusOffset);
      desiredLookAt.set(...focusPosition).add(landmarkLookAtHeightOffset);
    } else {
      desiredPosition.copy(followOffset).applyQuaternion(player.quaternion).add(player.position);
      desiredLookAt.copy(player.position).add(lookAtHeightOffset);
    }

    camera.position.lerp(desiredPosition, positionAlpha);
    currentLookAt.current.lerp(desiredLookAt, lookAtAlpha);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
