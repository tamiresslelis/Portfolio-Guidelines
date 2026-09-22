import { useEffect, useRef } from "react";

export interface MovementInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
}

const KEY_TO_INPUT: Partial<Record<string, keyof Omit<MovementInput, "run">>> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};

const RUN_KEYS = new Set(["ShiftLeft", "ShiftRight"]);

/**
 * Tracks WASD/arrow-key (+ Shift-to-run) input in a ref, not React state —
 * key press/release events are infrequent, but the *consumer* of this
 * (Player's own `useFrame`) reads it 60x/second, and re-rendering React on
 * every key event would be wasted work for a value nothing in the React
 * tree needs to display. `Player` reads `.current` directly inside its own
 * frame loop instead.
 */
export function usePlayerMovement() {
  const inputRef = useRef<MovementInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const input = KEY_TO_INPUT[event.code];
      if (input) inputRef.current[input] = true;
      if (RUN_KEYS.has(event.code)) inputRef.current.run = true;
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      const input = KEY_TO_INPUT[event.code];
      if (input) inputRef.current[input] = false;
      if (RUN_KEYS.has(event.code)) inputRef.current.run = false;
    };
    // Reset all input on blur — otherwise a key released while the tab/
    // window doesn't have focus (e.g. alt-tabbing) can get "stuck" down,
    // since its keyup event never reaches this listener.
    const handleBlur = () => {
      inputRef.current.forward = false;
      inputRef.current.backward = false;
      inputRef.current.left = false;
      inputRef.current.right = false;
      inputRef.current.run = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  return inputRef;
}
