// components/RelatedProducts/config.ts
export const DEFAULT_BREAKPOINTS = {
  0: {slidesPerView: 1, spaceBetween: 16},
  640: {slidesPerView: 2, spaceBetween: 20},
  768: {slidesPerView: 3, spaceBetween: 24},
  1024: {slidesPerView: 4, spaceBetween: 32},
  1280: {slidesPerView: 5, spaceBetween: 40},
};

export const SWIPER_CONFIG = {
  slidesPerViewAuto: {
    // slidesPerView: "auto",
    slidesPerView: 'auto' as const, // Explicitly set as "auto"
    spaceBetween: 24,
    centeredSlides: true,
    loopAdditionalSlides: 2,
  },
  pagination: {
    clickable: true,
    dynamicBullets: true,
  },
};

// Type definitions for TypeScript
export type BreakpointsConfig = typeof DEFAULT_BREAKPOINTS;
export type SwiperConfig = typeof SWIPER_CONFIG;
