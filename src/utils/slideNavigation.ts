/**
 * Slide Navigation Utilities
 *
 * Handles slide visibility, navigation, and presentation mode
 */

/**
 * Get all slide elements in the editor
 */
export function getAllSlides(editorElement: HTMLElement): HTMLElement[] {
  return Array.from(
    editorElement.querySelectorAll('[data-node-type="slide"]')
  ) as HTMLElement[];
}

/**
 * Get the total number of slides
 */
export function getSlideCount(editorElement: HTMLElement): number {
  return getAllSlides(editorElement).length;
}

/**
 * Show only the specified slide, hide all others
 * Used for presentation mode
 */
export function showSlide(
  editorElement: HTMLElement,
  slideIndex: number
): void {
  const slides = getAllSlides(editorElement);

  if (slideIndex < 0 || slideIndex >= slides.length) {
    console.warn(
      `[AutoArtifacts] Invalid slide index ${slideIndex}. ` +
        `Must be between 0 and ${slides.length - 1}`
    );
    return;
  }

  slides.forEach((slide, index) => {
    if (index === slideIndex) {
      slide.style.display = "block";
      slide.setAttribute("data-active", "true");
    } else {
      slide.style.display = "none";
      slide.setAttribute("data-active", "false");
    }
  });
}

/**
 * Show all slides
 * Used for edit and preview modes
 */
export function showAllSlides(editorElement: HTMLElement): void {
  const slides = getAllSlides(editorElement);

  slides.forEach((slide) => {
    slide.style.display = "block";
    slide.removeAttribute("data-active");
  });
}

/**
 * Get the index of the currently visible slide in presentation mode
 */
export function getCurrentSlideIndex(editorElement: HTMLElement): number {
  const slides = getAllSlides(editorElement);

  for (let i = 0; i < slides.length; i++) {
    if (slides[i].getAttribute("data-active") === "true") {
      return i;
    }
  }

  return 0; // Default to first slide
}

/**
 * Navigate to next slide
 */
export function nextSlide(
  editorElement: HTMLElement,
  onSlideChange?: (index: number) => void
): void {
  const currentIndex = getCurrentSlideIndex(editorElement);
  const slideCount = getSlideCount(editorElement);

  if (currentIndex < slideCount - 1) {
    const newIndex = currentIndex + 1;
    showSlide(editorElement, newIndex);
    if (onSlideChange) {
      onSlideChange(newIndex);
    }
  }
}

/**
 * Navigate to previous slide
 */
export function prevSlide(
  editorElement: HTMLElement,
  onSlideChange?: (index: number) => void
): void {
  const currentIndex = getCurrentSlideIndex(editorElement);

  if (currentIndex > 0) {
    const newIndex = currentIndex - 1;
    showSlide(editorElement, newIndex);
    if (onSlideChange) {
      onSlideChange(newIndex);
    }
  }
}

/**
 * Go to specific slide
 */
export function goToSlide(
  editorElement: HTMLElement,
  slideIndex: number,
  onSlideChange?: (index: number) => void
): void {
  showSlide(editorElement, slideIndex);
  if (onSlideChange) {
    onSlideChange(slideIndex);
  }
}
