import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLOR_TEAL } from '../../tokens/chartColors';
import type { ProjectionPoint } from '../../data/placeholders';
import { PLACEHOLDER_PROJECTION } from '../../data/placeholders';
import './WeightLineChart.css';

interface WeightLineChartProps {
  projection?: ProjectionPoint[];
}

export default function WeightLineChart({ projection = PLACEHOLDER_PROJECTION }: WeightLineChartProps) {
  return (
    <div className="weight-line">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={projection} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <XAxis dataKey="week" tickFormatter={(v: number) => `Week ${v}`} />
          <YAxis domain={['dataMin - 1', 'dataMax + 1']} unit=" kg" />
          <Tooltip formatter={(v) => [`${v} kg`, 'Weight']} />
          <Legend verticalAlign="bottom" height={36} />
          <Line
            type="monotone"
            dataKey="weight_kg"
            stroke={COLOR_TEAL}
            strokeWidth={2}
            dot={{ r: 4, fill: COLOR_TEAL }}
            name="Weight (kg)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
