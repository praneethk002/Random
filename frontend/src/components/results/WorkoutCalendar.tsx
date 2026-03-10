import type { WorkoutSchedule } from '../../data/placeholders';
import { PLACEHOLDER_SCHEDULE } from '../../data/placeholders';
import './WorkoutCalendar.css';

interface WorkoutCalendarProps {
  schedule?: WorkoutSchedule;
}

const DAY_LABELS: { key: keyof WorkoutSchedule; label: string }[] = [
  { key: 'monday',    label: 'Monday'    },
  { key: 'tuesday',   label: 'Tuesday'   },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday',  label: 'Thursday'  },
  { key: 'friday',    label: 'Friday'    },
  { key: 'saturday',  label: 'Saturday'  },
  { key: 'sunday',    label: 'Sunday'    },
];

export default function WorkoutCalendar({ schedule = PLACEHOLDER_SCHEDULE }: WorkoutCalendarProps) {
  return (
    <div className="workout-cal">
      {DAY_LABELS.map(({ key, label }) => {
        const exercises = schedule[key];
        return (
          <div key={key} className="workout-cal__day">
            <div className="workout-cal__day-header">
              <span className="workout-cal__day-label">{label}</span>
              {exercises && (
                <span className="workout-cal__day-count">{exercises.length} exercises</span>
              )}
            </div>
            <table className="workout-cal__table">
              <tbody>
                {exercises ? (
                  exercises.map((ex, i) => (
                    <tr key={i} className="workout-cal__row">
                      <td className="workout-cal__cell-exercise">{ex.exercise}</td>
                      <td className="workout-cal__cell-sets">{ex.sets} × {ex.reps}</td>
                      <td className="workout-cal__cell-duration">{ex.duration_min} min</td>
                      <td className="workout-cal__cell-muscle">
                        <span className="workout-cal__muscle-pill">{ex.muscle_group}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="workout-cal__rest-row" colSpan={4}>
                      Rest Day — Active Recovery
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
