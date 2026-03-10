// setupTests.ts — extends Vitest's expect with jest-dom matchers
// Required so toBeInTheDocument(), toHaveClass(), etc. work in tests
import '@testing-library/jest-dom/vitest';
