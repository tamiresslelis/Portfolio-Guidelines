import { useState } from "react";
import folderIcon from "../assets/desktop/folder-icon.svg";

interface DesktopFolderProps {
  id: string;
  title: string;
  /** Whether this folder's case study is the one currently open. */
  isOpen: boolean;
  onOpen: (id: string) => void;
}

/**
 * A single Windows XP desktop icon: click to select (a translucent blue
 * highlight, same as the real desktop), double-click to open — Enter/Space
 * open it in one step for keyboard users, since requiring two key presses
 * would be an accessibility regression the mouse interaction doesn't have.
 */
export function DesktopFolder({ id, title, isOpen, onOpen }: DesktopFolderProps) {
  const [isSelected, setIsSelected] = useState(false);

  const highlighted = isSelected || isOpen;

  return (
    <button
      type="button"
      onClick={() => setIsSelected(true)}
      onDoubleClick={() => onOpen(id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(id);
        }
      }}
      onFocus={() => setIsSelected(true)}
      onBlur={() => setIsSelected(false)}
      className={`flex w-28 flex-col items-center gap-1 rounded-[3px] border px-1 py-2 text-center transition-colors active:translate-y-px ${
        highlighted
          ? "border-dotted border-xp-selection-border bg-xp-selection-bg"
          : "border-transparent hover:border-dotted hover:border-xp-selection-border hover:bg-xp-selection-bg"
      }`}
      aria-label={`Open ${title} case study`}
      aria-pressed={isOpen}
    >
      <img
        src={folderIcon}
        alt=""
        width={48}
        height={40}
        className="[filter:drop-shadow(1px_2px_2px_rgba(0,0,0,0.5))] max-[600px]:w-9"
      />
      <span
        className="text-xp-sm leading-[1.25] font-semibold text-white [overflow-wrap:break-word]"
        style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)" }}
      >
        {title}
      </span>
    </button>
  );
}
