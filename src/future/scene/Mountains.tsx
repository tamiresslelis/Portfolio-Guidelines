interface MountainInstance {
  position: [number, number, number];
  radius: number;
  height: number;
}

// A handful of large, simple cones on the horizon — background layering
// per the visual-direction notes (foreground/midground/background
// separation), faded by fog rather than needing real geometry detail
// since they're never approached.
const MOUNTAINS: MountainInstance[] = [
  { position: [-24, 0, -30], radius: 10, height: 22 },
  { position: [-4, 0, -34], radius: 13, height: 27 },
  { position: [16, 0, -28], radius: 9, height: 19 },
  { position: [28, 0, -22], radius: 11, height: 24 },
];

/** A distant mountain silhouette, purely for atmospheric depth — flat
 *  matte material, no shadows (they're far enough that shadow cost isn't
 *  justified for what fog already mostly hides). */
export function Mountains() {
  return (
    <>
      {MOUNTAINS.map((mountain) => (
        <mesh key={mountain.position.join(",")} position={mountain.position}>
          <coneGeometry args={[mountain.radius, mountain.height, 5]} />
          <meshStandardMaterial color="#24413d" roughness={1} fog />
        </mesh>
      ))}
    </>
  );
}
