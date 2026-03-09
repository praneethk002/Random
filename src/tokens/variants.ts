// src/tokens/variants.ts
// Shared Framer Motion (motion/react) variant presets.
// Import in landing components for consistent scroll and entrance animations.

import type { Variants } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

/** Fade up from y:40, used for scroll reveals and hero entrance */
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** Container that staggers children — wrap a list with this */
export const staggerContainer = (staggerSecs = 0.08): Variants => ({
  hidden:  {},
  visible: { transition: { staggerChildren: staggerSecs } },
});

/** Child variant paired with staggerContainer */
export const staggerChild: Variants = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/** Card stagger — tighter, 60ms apart */
export const cardStagger = (staggerSecs = 0.06): Variants => ({
  hidden:  {},
  visible: { transition: { staggerChildren: staggerSecs } },
});

export const cardChild: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};
