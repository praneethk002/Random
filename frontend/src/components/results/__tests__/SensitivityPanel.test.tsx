import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test-utils';
import SensitivityPanel from '../SensitivityPanel';

describe('SensitivityPanel', () => {
  it('renders without props (uses default placeholder insights)', () => {
    render(<SensitivityPanel />);
    expect(screen.getByText('+1 gym day saves 0.8 weeks')).toBeInTheDocument();
  });

  it('root element has sens-panel class', () => {
    const { container } = render(<SensitivityPanel />);
    expect(container.firstChild).toHaveClass('sens-panel');
  });

  it('accepts an insights prop and renders it', () => {
    const customInsights = [{ id: 'test', text: 'Custom insight text' }];
    render(<SensitivityPanel insights={customInsights} />);
    expect(screen.getByText('Custom insight text')).toBeInTheDocument();
  });
});
