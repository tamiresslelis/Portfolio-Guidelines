import { useRef } from "react";
import type { Group } from "three";
import { SceneEnvironment } from "./SceneEnvironment";
import { Lighting } from "./Lighting";
import { Player } from "./Player";
import { CameraController } from "./CameraController";

/**
 * Composes everything inside `<Canvas>`. `playerRef` is created once here
 * and shared between `Player` (which attaches it to the actual Object3D)
 * and `CameraController` (which reads its live position every frame) —
 * a plain ref, not a store: at this scale (one player, one camera, no
 * other systems needing the same value yet) that's the whole state
 * -sharing problem solved with zero dependencies. Revisit if/when more
 * systems need to react to player position (see the architecture notes
 * on when a store like zustand would actually earn its place).
 */
export function FutureScene() {
  const playerRef = useRef<Group>(null);

  return (
    <>
      <SceneEnvironment />
      <Lighting />
      <Player playerRef={playerRef} />
      <CameraController playerRef={playerRef} />
    </>
  );
}
