import type { MealItem } from '../../data/placeholders';
import { PLACEHOLDER_MEALS } from '../../data/placeholders';
import './MealTable.css';

interface MealTableProps {
  data?: MealItem[];
}

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Evening';

function mealPillClass(meal: string): string {
  const map: Record<string, string> = {
    Breakfast: 'meal-pill--teal',
    Lunch:     'meal-pill--teal',
    Dinner:    'meal-pill--purple',
    Snack:     'meal-pill--grey',
    Evening:   'meal-pill--grey',
  };
  return 'meal-pill ' + (map[meal as MealType] ?? 'meal-pill--grey');
}

export default function MealTable({ data = PLACEHOLDER_MEALS }: MealTableProps) {
  const totals = data.reduce(
    (acc, row) => ({
      calories: acc.calories + row.calories,
      protein:  acc.protein  + row.protein,
      carbs:    acc.carbs    + row.carbs,
      fat:      acc.fat      + row.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="meal-table-wrapper">
      <table className="meal-table">
        <thead>
          <tr>
            <th className="meal-table__th">Meal</th>
            <th className="meal-table__th">Food</th>
            <th className="meal-table__th meal-table__th--num">Grams</th>
            <th className="meal-table__th meal-table__th--num">Calories</th>
            <th className="meal-table__th meal-table__th--num">Protein</th>
            <th className="meal-table__th meal-table__th--num">Carbs</th>
            <th className="meal-table__th meal-table__th--num">Fat</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="meal-table__row">
              <td className="meal-table__td">
                <span className={mealPillClass(row.meal)}>{row.meal}</span>
              </td>
              <td className="meal-table__td">{row.food}</td>
              <td className="meal-table__td meal-table__td--num">{row.grams}</td>
              <td className="meal-table__td meal-table__td--num">{row.calories}</td>
              <td className="meal-table__td meal-table__td--num">{row.protein}g</td>
              <td className="meal-table__td meal-table__td--num">{row.carbs}g</td>
              <td className="meal-table__td meal-table__td--num">{row.fat}g</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="meal-table__totals">
            <td className="meal-table__td meal-table__td--total" colSpan={3}>Totals</td>
            <td className="meal-table__td meal-table__td--num meal-table__td--total">{totals.calories}</td>
            <td className="meal-table__td meal-table__td--num meal-table__td--total">{totals.protein}g</td>
            <td className="meal-table__td meal-table__td--num meal-table__td--total">{totals.carbs}g</td>
            <td className="meal-table__td meal-table__td--num meal-table__td--total">{totals.fat}g</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
