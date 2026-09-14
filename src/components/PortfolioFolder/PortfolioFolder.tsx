import folderIcon from "../../assets/desktop/folder-icon.svg";
import styles from "./PortfolioFolder.module.css";

interface PortfolioFolderProps {
  id: string;
  label: string;
  /** Whether this folder's case study is the one currently open. */
  isOpen: boolean;
  onOpen: (id: string) => void;
}

/**
 * A desktop icon representing one case study. Opens on a single
 * click/tap/Enter — real Windows XP icons need a double-click, but a
 * portfolio visiting on a touch device (or a recruiter skimming quickly)
 * shouldn't need a second gesture to reach the content. Double-click still
 * works too, it's just redundant with the single click.
 */
export function PortfolioFolder({ id, label, isOpen, onOpen }: PortfolioFolderProps) {
  return (
    <button
      type="button"
      className={`${styles.folder} ${isOpen ? styles.open : ""}`}
      onClick={() => onOpen(id)}
      aria-label={`Open ${label} case study`}
      aria-pressed={isOpen}
    >
      <img src={folderIcon} alt="" className={styles.icon} width={48} height={40} />
      <span className={styles.label}>{label}</span>
    </button>
  );
}
