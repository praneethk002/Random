import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { COLOR_TEAL, COLOR_PURPLE, COLOR_TEXT_MUTED } from '../../tokens/chartColors';
import type { MacroData } from '../../data/placeholders';
import { PLACEHOLDER_MACROS } from '../../data/placeholders';
import './MacroPieChart.css';

const COLOR_FAT = '#9CA3AF';

interface MacroPieChartProps {
  macros?: MacroData;
}

const LEGEND_ITEMS = [
  { key: 'carbs_pct'   as const, label: 'Carbohydrates', color: COLOR_PURPLE },
  { key: 'protein_pct' as const, label: 'Protein',        color: COLOR_TEAL   },
  { key: 'fat_pct'     as const, label: 'Fat',            color: COLOR_FAT    },
];

function CenterLabel() {
  return (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="12"
      fill={COLOR_TEXT_MUTED}
    >
      Macros
    </text>
  );
}

export default function MacroPieChart({ macros = PLACEHOLDER_MACROS }: MacroPieChartProps) {
  const data = [
    { name: 'Carbohydrates', value: macros.carbs_pct,   color: COLOR_PURPLE },
    { name: 'Protein',       value: macros.protein_pct, color: COLOR_TEAL   },
    { name: 'Fat',           value: macros.fat_pct,     color: COLOR_FAT    },
  ];

  return (
    <div className="macro-pie">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={60}
            strokeWidth={0}
          >
            {data.map(entry => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
            <CenterLabel />
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value}%`, name]}
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="macro-pie__legend">
        {LEGEND_ITEMS.map(({ key, label, color }) => (
          <div key={key} className="macro-pie__legend-item">
            <span className="macro-pie__legend-dot" style={{ background: color }} />
            <span className="macro-pie__legend-label">{label}</span>
            <span className="macro-pie__legend-value">{macros[key]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
