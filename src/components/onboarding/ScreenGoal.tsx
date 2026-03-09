import { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingDown, Dumbbell, Repeat2 } from 'lucide-react';
import { staggerContainer, staggerChild } from '../../tokens/variants';
import './ScreenGoal.css';

export type GoalType = 'weight_loss' | 'muscle_gain' | 'body_recomposition';

interface GoalOption {
  id: GoalType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const GOALS: GoalOption[] = [
  {
    id: 'weight_loss',
    label: 'Weight Loss',
    description: 'Lose fat, feel lighter',
    icon: <TrendingDown size={32} />,
  },
  {
    id: 'muscle_gain',
    label: 'Muscle Gain',
    description: 'Build strength and size',
    icon: <Dumbbell size={32} />,
  },
  {
    id: 'body_recomposition',
    label: 'Body Recomposition',
    description: 'Lose fat, build muscle',
    icon: <Repeat2 size={32} />,
  },
];

interface ScreenGoalProps {
  onNext: (goal: GoalType) => void;
}

export default function ScreenGoal({ onNext }: ScreenGoalProps) {
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);

  return (
    <div className="screen-goal">
      <h1 className="screen-goal__title">What's your goal?</h1>
      <p className="screen-goal__subtitle">We'll build your entire plan around this.</p>

      <motion.div
        className="screen-goal__cards"
        variants={staggerContainer(0.1)}
        initial="hidden"
        animate="visible"
      >
        {GOALS.map((goal) => {
          const isSelected = selectedGoal === goal.id;
          return (
            <motion.button
              key={goal.id}
              className={`goal-card${isSelected ? ' goal-card--selected' : ''}`}
              onClick={() => setSelectedGoal(goal.id)}
              variants={staggerChild}
              aria-pressed={isSelected}
              type="button"
            >
              <span className="goal-card__icon">
                {goal.icon}
              </span>
              <span className="goal-card__label">{goal.label}</span>
              <span className="goal-card__desc">{goal.description}</span>
            </motion.button>
          );
        })}
      </motion.div>

      <div className="screen-goal__nav">
        <button
          className="btn btn--primary"
          disabled={selectedGoal === null}
          onClick={() => selectedGoal && onNext(selectedGoal)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
