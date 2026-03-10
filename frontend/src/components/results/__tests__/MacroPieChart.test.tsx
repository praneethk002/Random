import { describe, it, expect } from 'vitest';
import { render } from '../../../test-utils';
import MacroPieChart from '../MacroPieChart';
import { PLACEHOLDER_MACROS } from '../../../data/placeholders';

describe('MacroPieChart', () => {
  it('renders without props (uses placeholder data)', () => {
    const { container } = render(<MacroPieChart />);
    expect(container.querySelector('.macro-pie')).toBeInTheDocument();
  });

  it('renders without error when macros prop is passed', () => {
    expect(() => render(<MacroPieChart macros={PLACEHOLDER_MACROS} />)).not.toThrow();
  });

  it('wrapper has macro-pie CSS class', () => {
    const { container } = render(<MacroPieChart />);
    expect(container.querySelector('.macro-pie')).toBeInTheDocument();
  });
});
