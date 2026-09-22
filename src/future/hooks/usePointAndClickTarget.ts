import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Plane, Raycaster, Vector2, Vector3 } from "three";

const groundPlane = new Plane(new Vector3(0, 1, 0), 0);
const pointerNdc = new Vector2();
const intersection = new Vector3();

/**
 * A recruiter shouldn't need gaming experience to move around: clicking/
 * tapping anywhere on the ground sets a world-space target that `Player`
 * walks toward each frame (see its own `useFrame`), canceled the instant
 * WASD/arrow input resumes. Disabled while `enabled` is false (e.g. a
 * project overlay is open) so a click behind the dimmed overlay can't
 * move the player.
 */
export function usePointAndClickTarget(enabled: boolean) {
  const targetRef = useRef<Vector3 | null>(null);
  const { camera, gl } = useThree();
  const raycaster = useRef(new Raycaster());

  useEffect(() => {
    if (!enabled) return;
    const canvas = gl.domElement;

    const handlePointerDown = (event: PointerEvent) => {
      // Only the primary button/touch — not a drag-to-look right-click,
      // if one is ever added.
      if (event.button !== 0) return;

      const rect = canvas.getBoundingClientRect();
      pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(pointerNdc, camera);
      if (raycaster.current.ray.intersectPlane(groundPlane, intersection)) {
        targetRef.current = intersection.clone();
      }
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    return () => canvas.removeEventListener("pointerdown", handlePointerDown);
  }, [enabled, camera, gl]);

  useEffect(() => {
    if (!enabled) targetRef.current = null;
  }, [enabled]);

  return targetRef;
}
