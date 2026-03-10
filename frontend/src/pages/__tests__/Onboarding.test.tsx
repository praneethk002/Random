// Tests for Onboarding page — 4-screen flow
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import Onboarding from '../Onboarding';

// Silence console.error from React about missing context in tests
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Onboarding', () => {
  it('renders Next button with primary variant class on screen 1', () => {
    const { container } = render(<Onboarding />);
    const primaryBtn = container.querySelector('.btn--primary');
    expect(primaryBtn).not.toBeNull();
  });

  it('Back button is not rendered on screen 1', () => {
    render(<Onboarding />);
    const backBtn = screen.queryByText('Back');
    expect(backBtn).toBeNull();
  });

  it('Back button appears after advancing to screen 2', async () => {
    const { container } = render(<Onboarding />);
    // Screen 1 is ScreenGoal — select a goal card to enable Next
    const goalCard = container.querySelector('.goal-card') as HTMLElement;
    if (goalCard) {
      fireEvent.click(goalCard);
    }
    const nextBtn = container.querySelector('.btn--primary') as HTMLElement;
    if (nextBtn && !nextBtn.hasAttribute('disabled')) {
      fireEvent.click(nextBtn);
    }
    // Screen 2 is ScreenAbout which renders its own Back button
    await waitFor(() => {
      const backBtn = screen.queryByText('Back');
      expect(backBtn).not.toBeNull();
    });
  });
});
