import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test-utils';
import MealTable from '../MealTable';

describe('MealTable', () => {
  it('renders without props (uses default placeholder data)', () => {
    render(<MealTable />);
    expect(screen.getByText('Oats with banana')).toBeInTheDocument();
  });

  it('renders all 7 column headers', () => {
    render(<MealTable />);
    expect(screen.getByText('Meal')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Grams')).toBeInTheDocument();
    expect(screen.getByText('Calories')).toBeInTheDocument();
    expect(screen.getByText('Protein')).toBeInTheDocument();
    expect(screen.getByText('Fat')).toBeInTheDocument();
    expect(screen.getByText('Carbs')).toBeInTheDocument();
    expect(screen.queryByText('Cost')).not.toBeInTheDocument();
  });

  it('renders 6 placeholder data rows', () => {
    render(<MealTable />);
    expect(screen.getByText('Oats with banana')).toBeInTheDocument();
    expect(screen.getByText('Greek yogurt + honey')).toBeInTheDocument();
    expect(screen.getByText('Chicken breast + brown rice')).toBeInTheDocument();
    expect(screen.getByText('Salmon fillet + sweet potato')).toBeInTheDocument();
    expect(screen.getByText('Cottage cheese')).toBeInTheDocument();
  });

  it('renders totals row', () => {
    render(<MealTable />);
    expect(screen.getByText('Totals')).toBeInTheDocument();
  });

  it('numeric td elements have meal-table__td--num class', () => {
    const { container } = render(<MealTable />);
    const numericCells = container.querySelectorAll('.meal-table__td--num');
    expect(numericCells.length).toBeGreaterThan(0);
  });

  it('accepts a data prop and renders it', () => {
    const singleItem = [
      { meal: 'Lunch', food: 'Test food', grams: 100, calories: 200, protein: 20, fat: 5, carbs: 10 },
    ];
    render(<MealTable data={singleItem} />);
    expect(screen.getByText('Test food')).toBeInTheDocument();
  });
});
