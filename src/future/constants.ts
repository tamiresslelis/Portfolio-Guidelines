/** Tuning constants for the future experience — centralized so
 *  `Player`/`CameraController`/movement hooks don't scatter magic numbers. */

/** Units/second the player moves at. */
export const PLAYER_SPEED = 4;

/** Half-extents of the walkable ground, in world units — a simple
 *  rectangular boundary clamp rather than a physics engine (see the
 *  architecture notes: this world has no complex physics needs). */
export const WORLD_BOUNDS = { x: 18, z: 18 };

/** How quickly the camera eases toward its target position/look-at each
 *  frame (higher = snappier, lower = lazier) — kept gentle on purpose per
 *  the "calm, premium, not motion-sickness-inducing" camera requirement. */
export const CAMERA_POSITION_DAMPING = 4;
export const CAMERA_LOOKAT_DAMPING = 6;

/** Camera offset from the player, in the player's local space. */
export const CAMERA_OFFSET: [number, number, number] = [0, 3.2, 6.5];

/** Fixed cinematic offset from a landmark's own position, used while its
 *  project overlay is open (see CameraController's "focus" mode) — a
 *  world-space offset, not player-relative, since the camera is no
 *  longer following the player at that point. */
export const CAMERA_FOCUS_OFFSET: [number, number, number] = [0, 2.6, 7];

/** Multiplies PLAYER_SPEED while Shift is held. */
export const PLAYER_RUN_MULTIPLIER = 1.8;

/** Distance (world units) within which a landmark counts as "near enough
 *  to interact with". */
export const LANDMARK_INTERACTION_RADIUS = 4;

/** Point-and-click movement: how close the player needs to get to a
 *  clicked ground target before it's considered "arrived" and cleared. */
export const CLICK_TARGET_ARRIVAL_DISTANCE = 0.3;

/** Capped device pixel ratio for the renderer — mirrors the same reasoning
 *  already applied to the PDF viewer (MAX_DEVICE_PIXEL_RATIO in
 *  PdfPage.tsx): a 3x-DPR phone asking for 3x-resolution WebGL buys no
 *  visible sharpness over 2x at normal viewing distance, at real memory/
 *  fill-rate cost. */
export const MAX_RENDERER_PIXEL_RATIO = 2;
