import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test-utils';
import KPICard from '../KPICard';

describe('KPICard', () => {
  it('renders the value string', () => {
    render(<KPICard label="Weeks to Goal" value="6.8" />);
    expect(screen.getByText('6.8')).toBeInTheDocument();
  });

  it('renders the label string', () => {
    render(<KPICard label="Weeks to Goal" value="6.8" />);
    expect(screen.getByText('Weeks to Goal')).toBeInTheDocument();
  });

  it('value element has kpi-card__value class', () => {
    render(<KPICard label="Daily Calories" value="1,897 kcal" />);
    const valueEl = screen.getByText('1,897 kcal');
    expect(valueEl).toHaveClass('kpi-card__value');
  });

  it('label element has kpi-card__label class', () => {
    render(<KPICard label="Weekly Gym Hours" value="3.0 hrs/week" />);
    const labelEl = screen.getByText('Weekly Gym Hours');
    expect(labelEl).toHaveClass('kpi-card__label');
  });
});
