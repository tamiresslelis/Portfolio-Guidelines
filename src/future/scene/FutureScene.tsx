import { useRef } from "react";
import type { Group } from "three";
import { SceneEnvironment } from "./SceneEnvironment";
import { Lighting } from "./Lighting";
import { Player } from "./Player";
import { CameraController } from "./CameraController";
import { Landmark } from "./Landmark";
import { Vegetation } from "./Vegetation";
import { Mountains } from "./Mountains";
import { Particles } from "./Particles";
import { Blossoms } from "./Blossoms";
import { projectLandmarks } from "../data/landmarks";
import { groundPosition } from "../utils/terrain";
import type { ProjectLandmark } from "../types/career";

interface FutureSceneProps {
  /** The landmark whose project overlay is currently open, if any — owned
   *  by `FuturePortfolio` (outside the canvas, since the overlay itself is
   *  DOM) and threaded down here so the camera can shift into cinematic
   *  focus on it. */
  activeLandmark: ProjectLandmark | null;
  onProximityChange: (id: string, isNear: boolean) => void;
}

/**
 * Composes everything inside `<Canvas>`. `playerRef` is created once here
 * and shared between `Player` (which attaches it to the actual Object3D)
 * and `CameraController`/`Landmark` (which read its live position every
 * frame) — a plain ref, not a store: at this scale (one player, one
 * camera, a handful of landmarks) that's the whole state-sharing problem
 * solved with zero dependencies. Revisit if/when more systems need to
 * react to the same high-frequency value (see the architecture notes on
 * when a store like zustand would actually earn its place).
 */
export function FutureScene({ activeLandmark, onProximityChange }: FutureSceneProps) {
  const playerRef = useRef<Group>(null);

  return (
    <>
      <SceneEnvironment />
      <Mountains />
      <Vegetation />
      <Blossoms />
      <Particles />
      <Lighting />
      {projectLandmarks.map((landmark) => (
        <Landmark key={landmark.id} landmark={landmark} playerRef={playerRef} onProximityChange={onProximityChange} />
      ))}
      <Player playerRef={playerRef} movementEnabled={activeLandmark === null} />
      <CameraController
        playerRef={playerRef}
        focusPosition={activeLandmark ? groundPosition(activeLandmark.position) : null}
      />
    </>
  );
}
