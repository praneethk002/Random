import type { SensitivityInsight } from '../../data/placeholders';
import { PLACEHOLDER_INSIGHTS } from '../../data/placeholders';
import './SensitivityPanel.css';

interface SensitivityPanelProps {
  insights?: SensitivityInsight[];
}

export default function SensitivityPanel({ insights = PLACEHOLDER_INSIGHTS }: SensitivityPanelProps) {
  return (
    <div className="sens-panel">
      <h3 className="sens-panel__heading">What changes your timeline</h3>
      <ul className="sens-panel__list">
        {insights.map(insight => (
          <li key={insight.id} className="sens-panel__insight">
            {insight.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
