import type { CaseSlideData } from "../../data/cases";
import styles from "./CaseSlide.module.css";

interface CaseSlideProps {
  slide: CaseSlideData;
}

/** Renders a single case-study slide's artwork and optional caption. */
export function CaseSlide({ slide }: CaseSlideProps) {
  return (
    <figure className={styles.slide}>
      <img src={slide.image} alt={slide.alt} className={styles.image} />
      {slide.caption && <figcaption className={styles.caption}>{slide.caption}</figcaption>}
    </figure>
  );
}
