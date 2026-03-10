import { describe, it, expect } from 'vitest';
import {
  COLOR_TEAL,
  COLOR_TEAL_LIGHT,
  COLOR_TEAL_DARK,
  COLOR_PURPLE,
  COLOR_PURPLE_LIGHT,
  COLOR_NEUTRAL_100,
  COLOR_BG,
  COLOR_SURFACE,
  COLOR_BORDER,
  COLOR_TEXT_PRIMARY,
  COLOR_TEXT_MUTED,
} from './chartColors';

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

describe('chartColors', () => {
  const allColors = {
    COLOR_TEAL,
    COLOR_TEAL_LIGHT,
    COLOR_TEAL_DARK,
    COLOR_PURPLE,
    COLOR_PURPLE_LIGHT,
    COLOR_NEUTRAL_100,
    COLOR_BG,
    COLOR_SURFACE,
    COLOR_BORDER,
    COLOR_TEXT_PRIMARY,
    COLOR_TEXT_MUTED,
  };

  it('exports named hex constants matching 6-digit hex format', () => {
    for (const [name, value] of Object.entries(allColors)) {
      expect(value, `${name} must be a 6-digit hex string`).toMatch(HEX_PATTERN);
    }
  });

  it('exports COLOR_TEAL as the primary brand colour (#0D9488)', () => {
    expect(COLOR_TEAL).toBe('#0D9488');
  });

  it('exports COLOR_PURPLE as the data colour (#7C3AED)', () => {
    expect(COLOR_PURPLE).toBe('#7C3AED');
  });
});
