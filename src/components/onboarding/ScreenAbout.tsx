import { useState } from 'react';
import './ScreenAbout.css';

export type SexType = 'male' | 'female';
export type ActivityLevel = '1-2' | '3-4' | '5+';

interface ActivityOption {
  id: ActivityLevel;
  label: string;
  subtitle: string;
}

const ACTIVITY_OPTIONS: ActivityOption[] = [
  { id: '1-2', label: '1–2 days/week', subtitle: 'Light activity' },
  { id: '3-4', label: '3–4 days/week', subtitle: 'Moderate activity' },
  { id: '5+', label: '5+ days/week', subtitle: 'High activity' },
];

export interface AboutData {
  sex: SexType | null;
  age: string;
  height: string;
  activityLevel: ActivityLevel | null;
}

interface ScreenAboutProps {
  onNext: (data: AboutData) => void;
  onBack: () => void;
}

export default function ScreenAbout({ onNext, onBack }: ScreenAboutProps) {
  const [sex, setSex] = useState<SexType | null>(null);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);

  const isValid = sex !== null && age.trim() !== '' && height.trim() !== '' && activityLevel !== null;

  return (
    <div className="screen-about">
      <h1 className="screen-about__title">Tell us about yourself.</h1>
      <p className="screen-about__subtitle">Used to calculate your calorie and macro targets.</p>

      <div className="screen-about__fields">
        {/* Sex */}
        <div className="field-group">
          <label className="field-label">Sex</label>
          <div className="toggle-pair">
            <button
              type="button"
              className={`toggle-btn${sex === 'male' ? ' toggle-btn--active' : ''}`}
              onClick={() => setSex('male')}
              aria-pressed={sex === 'male'}
            >
              Male
            </button>
            <button
              type="button"
              className={`toggle-btn${sex === 'female' ? ' toggle-btn--active' : ''}`}
              onClick={() => setSex('female')}
              aria-pressed={sex === 'female'}
            >
              Female
            </button>
          </div>
        </div>

        {/* Age */}
        <div className="field-group">
          <label className="field-label" htmlFor="age-input">Age</label>
          <div className="input-suffix-wrap">
            <input
              id="age-input"
              type="number"
              className="number-input"
              placeholder="25"
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
            <span className="input-suffix">years</span>
          </div>
        </div>

        {/* Height */}
        <div className="field-group">
          <label className="field-label" htmlFor="height-input">Height</label>
          <div className="input-suffix-wrap">
            <input
              id="height-input"
              type="number"
              className="number-input"
              placeholder="175"
              min={50}
              max={300}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
            <span className="input-suffix">cm</span>
          </div>
        </div>

        {/* Activity level */}
        <div className="field-group">
          <label className="field-label">How active are you currently?</label>
          <div className="option-cards">
            {ACTIVITY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`option-card${activityLevel === opt.id ? ' option-card--selected' : ''}`}
                onClick={() => setActivityLevel(opt.id)}
                aria-pressed={activityLevel === opt.id}
              >
                <span className="option-card__label">{opt.label}</span>
                <span className="option-card__sub">{opt.subtitle}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="screen-about__nav">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="btn btn--primary"
          disabled={!isValid}
          onClick={() => isValid && onNext({ sex, age, height, activityLevel })}
        >
          Next
        </button>
      </div>
    </div>
  );
}
