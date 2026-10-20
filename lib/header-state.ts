/** Scroll distance (px) after which the header gains its background. */
export const HEADER_SCROLL_THRESHOLD = 8;

export function headerStateFor(scrollY: number): { scrolled: boolean } {
  return { scrolled: scrollY > HEADER_SCROLL_THRESHOLD };
}
