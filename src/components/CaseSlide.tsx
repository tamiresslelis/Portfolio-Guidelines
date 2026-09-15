import type { CaseSlideData } from "../data/cases";

interface CaseSlideProps {
  slide: CaseSlideData;
}

/** Renders a single case-study slide's artwork and optional caption. */
export function CaseSlide({ slide }: CaseSlideProps) {
  return (
    <figure className="m-0 flex h-full w-full flex-col items-center justify-center">
      <img
        src={slide.image}
        alt={slide.alt}
        className="max-h-full max-w-full border border-black/15 bg-white object-contain"
      />
      {slide.caption && (
        <figcaption className="mt-2 text-center text-xp-sm text-[#444]">{slide.caption}</figcaption>
      )}
    </figure>
  );
}
