import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { GoalType } from './ScreenGoal';
import './ScreenBody.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
type Day = (typeof DAYS)[number];

type SessionLength = '45min' | '1hr' | '1.5hr';

interface SessionOption {
  id: SessionLength;
  label: string;
}

const SESSION_OPTIONS: SessionOption[] = [
  { id: '45min', label: '45 min' },
  { id: '1hr', label: '1 hour' },
  { id: '1.5hr', label: '1.5 hours' },
];

export interface BodyData {
  startWeight: string;
  targetWeight: string;
  selectedDays: Day[];
  sessionLength: SessionLength | null;
  weeks: string;
}

interface ScreenBodyProps {
  onNext: (data: BodyData) => void;
  onBack: () => void;
  goal: GoalType | null;
}

/* Safe rates */
const SAFE_LOSS_PER_WEEK = 1.0;   // kg/week
const SAFE_GAIN_PER_WEEK = 0.25;  // kg/week

function getWeekWarning(
  goal: GoalType | null,
  startWeight: string,
  targetWeight: string,
  weeks: string,
): string | null {
  if (!goal || goal === 'body_recomposition') return null;
  const start = parseFloat(startWeight);
  const target = parseFloat(targetWeight);
  const w = parseInt(weeks, 10);
  if (isNaN(start) || isNaN(target) || isNaN(w) || w <= 0) return null;

  const diff = Math.abs(target - start);
  if (diff === 0) return null;

  if (goal === 'weight_loss') {
    if (target >= start) return null;
    const minWeeks = Math.ceil(diff / SAFE_LOSS_PER_WEEK);
    const recWeeks = Math.ceil(diff / (SAFE_LOSS_PER_WEEK * 0.5));
    if (w < minWeeks) {
      return `⚠ ${minWeeks} weeks is the minimum safe timeline to lose ${diff.toFixed(1)}kg. Losing more than 1kg per week risks muscle loss and nutrient deficiency.`;
    }
    if (w > minWeeks * 3) {
      return `⚠ ${w} weeks may be longer than needed. Most people achieve this goal in ${minWeeks}–${recWeeks} weeks.`;
    }
  }

  if (goal === 'muscle_gain') {
    if (target <= start) return null;
    const minWeeks = Math.ceil(diff / SAFE_GAIN_PER_WEEK);
    if (w < minWeeks) {
      return `⚠ Gaining ${diff.toFixed(1)} kg of muscle in ${w} weeks is not physiologically realistic. We recommend at least ${minWeeks} weeks.`;
    }
  }

  return null;
}

export default function ScreenBody({ onNext, onBack, goal }: ScreenBodyProps) {
  const [startWeight, setStartWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const [sessionLength, setSessionLength] = useState<SessionLength | null>(null);
  const [weeks, setWeeks] = useState('');

  const gap =
    startWeight !== '' && targetWeight !== ''
      ? parseFloat(targetWeight) - parseFloat(startWeight)
      : null;

  const weekWarning = getWeekWarning(goal, startWeight, targetWeight, weeks);

  const allSelected = selectedDays.length === DAYS.length;
  const toggleSelectAll = () => {
    setSelectedDays(allSelected ? [] : [...DAYS]);
  };

  const toggleDay = (day: Day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const isValid =
    startWeight.trim() !== '' &&
    targetWeight.trim() !== '' &&
    selectedDays.length >= 1 &&
    sessionLength !== null &&
    weeks.trim() !== '';

  return (
    <div className="screen-body">
      <h1 className="screen-body__title">Let's set your targets.</h1>
      <p className="screen-body__subtitle">These drive the optimisation model.</p>

      <div className="screen-body__fields">
        {/* Starting weight */}
        <div className="field-group">
          <label className="field-label" htmlFor="start-weight">Current weight</label>
          <div className="input-suffix-wrap">
            <input
              id="start-weight"
              type="number"
              className="number-input"
              placeholder="80"
              min={20}
              max={300}
              value={startWeight}
              onChange={(e) => setStartWeight(e.target.value)}
            />
            <span className="input-suffix">kg</span>
          </div>
        </div>

        {/* Target weight */}
        <div className="field-group">
          <label className="field-label" htmlFor="target-weight">Target weight</label>
          <div className="input-suffix-wrap">
            <input
              id="target-weight"
              type="number"
              className="number-input"
              placeholder="75"
              min={20}
              max={300}
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
            />
            <span className="input-suffix">kg</span>
          </div>

          <AnimatePresence>
            {gap !== null && !isNaN(gap) && (
              <motion.p
                className={`weight-gap${gap < 0 ? ' weight-gap--lose' : ' weight-gap--gain'}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {gap < 0
                  ? `You want to lose ${Math.abs(gap).toFixed(1)} kg`
                  : `You want to gain ${gap.toFixed(1)} kg`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Goal deadline */}
        <div className="field-group">
          <label className="field-label" htmlFor="weeks-input">What's your goal deadline?</label>
          <div className="input-suffix-wrap">
            <input
              id="weeks-input"
              type="number"
              className="number-input"
              placeholder="12"
              min={1}
              max={52}
              value={weeks}
              onChange={(e) => setWeeks(e.target.value)}
            />
            <span className="input-suffix">weeks</span>
          </div>

          <AnimatePresence>
            {weekWarning && (
              <motion.p
                className="week-warning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {weekWarning}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Available days */}
        <div className="field-group">
          <div className="field-label-row">
            <label className="field-label">Available days</label>
            <button
              type="button"
              className="select-all-btn"
              onClick={toggleSelectAll}
            >
              {allSelected ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <div className="day-grid">
            {DAYS.map((day) => {
              const active = selectedDays.includes(day);
              return (
                <motion.button
                  key={day}
                  type="button"
                  className={`day-pill${active ? ' day-pill--active' : ''}`}
                  onClick={() => toggleDay(day)}
                  animate={{ scale: active ? 1.05 : 1 }}
                  transition={{ duration: 0.15 }}
                  aria-pressed={active}
                >
                  {day}
                </motion.button>
              );
            })}
          </div>
          <p className="days-count">
            {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Session length */}
        <div className="field-group">
          <label className="field-label">How long per session?</label>
          <div className="option-cards-row">
            {SESSION_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`option-chip${sessionLength === opt.id ? ' option-chip--selected' : ''}`}
                onClick={() => setSessionLength(opt.id)}
                aria-pressed={sessionLength === opt.id}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="screen-body__nav">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="btn btn--primary"
          disabled={!isValid}
          onClick={() =>
            isValid && onNext({ startWeight, targetWeight, selectedDays, sessionLength, weeks })
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}
