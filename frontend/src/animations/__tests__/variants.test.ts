import { describe, it, expect } from 'vitest';
import {
  fadeUp,
  scrollReveal,
  staggerContainer,
  slideLeft,
  slideRight,
  resultsStagger,
} from '../variants';

const hasViewport = (obj: unknown): boolean => {
  if (typeof obj !== 'object' || obj === null) return false;
  if ('viewport' in obj) return true;
  return Object.values(obj).some(hasViewport);
};

describe('variants.ts', () => {
  describe('fadeUp', () => {
    it('has initial, animate, exit states', () => {
      expect(fadeUp).toHaveProperty('initial');
      expect(fadeUp).toHaveProperty('animate');
      expect(fadeUp).toHaveProperty('exit');
    });
    it('initial is invisible (opacity 0)', () => {
      expect((fadeUp.initial as Record<string, unknown>).opacity).toBe(0);
    });
    it('animate is visible (opacity 1)', () => {
      expect((fadeUp.animate as Record<string, unknown>).opacity).toBe(1);
    });
  });

  describe('scrollReveal', () => {
    it('has initial, animate, exit states', () => {
      expect(scrollReveal).toHaveProperty('initial');
      expect(scrollReveal).toHaveProperty('animate');
      expect(scrollReveal).toHaveProperty('exit');
    });
  });

  describe('staggerContainer', () => {
    it('has initial and animate states', () => {
      expect(staggerContainer).toHaveProperty('initial');
      expect(staggerContainer).toHaveProperty('animate');
    });
    it('animate.transition.staggerChildren is 0.1', () => {
      const animate = staggerContainer.animate as Record<string, unknown>;
      const transition = animate.transition as Record<string, unknown>;
      expect(transition.staggerChildren).toBe(0.1);
    });
  });

  describe('resultsStagger', () => {
    it('has initial and animate states', () => {
      expect(resultsStagger).toHaveProperty('initial');
      expect(resultsStagger).toHaveProperty('animate');
    });
    it('animate.transition.staggerChildren is 0.15', () => {
      const animate = resultsStagger.animate as Record<string, unknown>;
      const transition = animate.transition as Record<string, unknown>;
      expect(transition.staggerChildren).toBe(0.15);
    });
  });

  describe('slideLeft', () => {
    it('has initial, animate, exit states', () => {
      expect(slideLeft).toHaveProperty('initial');
      expect(slideLeft).toHaveProperty('animate');
      expect(slideLeft).toHaveProperty('exit');
    });
    it('initial.x is positive (enters from right)', () => {
      const initial = slideLeft.initial as Record<string, unknown>;
      expect(typeof initial.x).toBe('number');
      expect(initial.x as number).toBeGreaterThan(0);
    });
  });

  describe('slideRight', () => {
    it('has initial, animate, exit states', () => {
      expect(slideRight).toHaveProperty('initial');
      expect(slideRight).toHaveProperty('animate');
      expect(slideRight).toHaveProperty('exit');
    });
    it('initial.x is negative (enters from left)', () => {
      const initial = slideRight.initial as Record<string, unknown>;
      expect(typeof initial.x).toBe('number');
      expect(initial.x as number).toBeLessThan(0);
    });
  });

  describe('ANIM-02: no viewport key in any variant', () => {
    it('fadeUp has no viewport key', () => expect(hasViewport(fadeUp)).toBe(false));
    it('scrollReveal has no viewport key', () => expect(hasViewport(scrollReveal)).toBe(false));
    it('staggerContainer has no viewport key', () => expect(hasViewport(staggerContainer)).toBe(false));
    it('slideLeft has no viewport key', () => expect(hasViewport(slideLeft)).toBe(false));
    it('slideRight has no viewport key', () => expect(hasViewport(slideRight)).toBe(false));
    it('resultsStagger has no viewport key', () => expect(hasViewport(resultsStagger)).toBe(false));
  });
});
