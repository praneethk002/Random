// Tests for ProgressBar component — 4-screen flow
import { describe, it, expect } from 'vitest';
import { render } from '../../../test-utils';
import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders 4 segment divs by default', () => {
    const { container } = render(<ProgressBar currentScreen={1} />);
    const segments = container.querySelectorAll('.progress-bar__segment');
    expect(segments).toHaveLength(4);
  });

  it('fills 1 segment when currentScreen is 1', () => {
    const { container } = render(<ProgressBar currentScreen={1} />);
    const filled = container.querySelectorAll('.progress-bar__segment--filled');
    expect(filled).toHaveLength(1);
  });

  it('fills 2 segments when currentScreen is 2', () => {
    const { container } = render(<ProgressBar currentScreen={2} />);
    const filled = container.querySelectorAll('.progress-bar__segment--filled');
    expect(filled).toHaveLength(2);
  });

  it('fills 3 segments when currentScreen is 3', () => {
    const { container } = render(<ProgressBar currentScreen={3} />);
    const filled = container.querySelectorAll('.progress-bar__segment--filled');
    expect(filled).toHaveLength(3);
  });

  it('fills 4 segments when currentScreen is 4', () => {
    const { container } = render(<ProgressBar currentScreen={4} />);
    const filled = container.querySelectorAll('.progress-bar__segment--filled');
    expect(filled).toHaveLength(4);
  });
});
