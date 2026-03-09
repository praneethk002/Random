import { describe, it, expect } from 'vitest';
import { render } from '../../../test-utils';
import WeightLineChart from '../WeightLineChart';
import { PLACEHOLDER_PROJECTION } from '../../../data/placeholders';

describe('WeightLineChart', () => {
  it('renders without props (uses placeholder data)', () => {
    const { container } = render(<WeightLineChart />);
    expect(container.querySelector('.weight-line')).toBeInTheDocument();
  });

  it('renders without error when projection prop is passed', () => {
    expect(() => render(<WeightLineChart projection={PLACEHOLDER_PROJECTION} />)).not.toThrow();
  });

  it('wrapper has weight-line CSS class', () => {
    const { container } = render(<WeightLineChart />);
    expect(container.querySelector('.weight-line')).toBeInTheDocument();
  });
});
