import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test-utils';
import WorkoutCalendar from '../WorkoutCalendar';

describe('WorkoutCalendar', () => {
  it('renders without props (uses default placeholder schedule)', () => {
    render(<WorkoutCalendar />);
    expect(screen.getByText('Barbell Squat')).toBeInTheDocument();
  });

  it('renders all 7 day labels', () => {
    render(<WorkoutCalendar />);
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('renders rest day text for null schedule days', () => {
    render(<WorkoutCalendar />);
    const restCells = screen.getAllByText('Rest Day — Active Recovery');
    expect(restCells.length).toBeGreaterThan(0);
  });

  it('renders exercise name and duration for active days', () => {
    render(<WorkoutCalendar />);
    expect(screen.getByText('Barbell Squat')).toBeInTheDocument();
    expect(screen.getAllByText(/min/).length).toBeGreaterThan(0);
  });

  it('renders muscle group pills', () => {
    render(<WorkoutCalendar />);
    expect(screen.getByText('Legs')).toBeInTheDocument();
    expect(screen.getByText('Chest')).toBeInTheDocument();
  });

  it('accepts a schedule prop and renders it', () => {
    const customSchedule = {
      monday: [{ exercise: 'Custom Exercise', sets: 3, reps: '10', duration_min: 30, muscle_group: 'Arms' }],
      tuesday: null, wednesday: null, thursday: null,
      friday: null, saturday: null, sunday: null,
    };
    render(<WorkoutCalendar schedule={customSchedule} />);
    expect(screen.getByText('Custom Exercise')).toBeInTheDocument();
  });
});
