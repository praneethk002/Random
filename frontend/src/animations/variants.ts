// src/animations/variants.ts
// Shared Framer Motion variant objects — consumed by Phase 8 (Landing animations)
// and Phase 9 (Onboarding + Results animations).
//
// CONSUMPTION NOTE (for Phase 9):
//   viewport={{ once: true, amount: 0.3 }} belongs on <motion.div> at the call site,
//   NOT inside these variant objects. See ANIM-02.
//
// Import: import { type Variants } from 'motion/react'  (type-only, zero runtime cost)

import { type Variants } from 'motion/react';

const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const DURATION = 0.5;
const DURATION_EXIT = 0.3;

/** Fade in rising from below — entry animation for page-level elements */
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION, ease: EASE_EXPO },
  },
  exit: {
    opacity: 0,
    y: 24,
    transition: { duration: DURATION_EXIT, ease: EASE_EXPO },
  },
};

/** Same motion as fadeUp but used with whileInView at consumption site for scroll reveals.
 *  viewport={{ once: true, amount: 0.3 }} is set on <motion.div>, NOT in this object. */
export const scrollReveal: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION, ease: EASE_EXPO },
  },
  exit: {
    opacity: 0,
    y: 24,
    transition: { duration: DURATION_EXIT, ease: EASE_EXPO },
  },
};

/** Stagger parent — wraps groups of cards/items to stagger child animations by 0.1s */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

/** Slide in from right (element travels leftward) — used for right-hand panel entries */
export const slideLeft: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION, ease: EASE_EXPO },
  },
  exit: {
    opacity: 0,
    x: 40,
    transition: { duration: DURATION_EXIT, ease: EASE_EXPO },
  },
};

/** Slide in from left (element travels rightward) — used for left-hand panel entries */
export const slideRight: Variants = {
  initial: { opacity: 0, x: -40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION, ease: EASE_EXPO },
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: { duration: DURATION_EXIT, ease: EASE_EXPO },
  },
};

/** Results dashboard stagger container — staggers sections by 0.15s for the heavier entry sequence */
export const resultsStagger: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.15 },
  },
};
