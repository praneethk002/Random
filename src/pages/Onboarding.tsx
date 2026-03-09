import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/onboarding/ProgressBar';
import ScreenGoal, { type GoalType } from '../components/onboarding/ScreenGoal';
import ScreenAbout, { type AboutData } from '../components/onboarding/ScreenAbout';
import ScreenBody, { type BodyData } from '../components/onboarding/ScreenBody';
import ScreenPreferences from '../components/onboarding/ScreenPreferences';
import './Onboarding.css';

const SESSION_HOURS: Record<string, number> = { '45min': 0.75, '1hr': 1.0, '1.5hr': 1.5 };
const GOAL_MAP: Record<GoalType, string> = {
  weight_loss: 'weight_loss',
  muscle_gain: 'muscle_gain',
  body_recomposition: 'time_min',
};
const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const SCREEN_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const TRANSITION = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState(1);
  const [direction, setDirection] = useState(1);
  const [goal, setGoal] = useState<GoalType | null>(null);
  const [bodyData, setBodyData] = useState<BodyData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const goNext = () => {
    setDirection(1);
    setCurrentScreen((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentScreen((s) => s - 1);
  };

  const handleSubmit = async (prefs: { restrictions: string[] }) => {
    if (!goal || !bodyData) return;

    const availability = Object.fromEntries(
      ALL_DAYS.map((day) => [day, bodyData.selectedDays.includes(day as typeof ALL_DAYS[number]) ? 1 : 0])
    );

    const payload = {
      goal: GOAL_MAP[goal],
      weight_kg: parseFloat(bodyData.startWeight),
      target_kg: parseFloat(bodyData.targetWeight),
      weeks: parseInt(bodyData.weeks, 10),
      budget_day: 10,
      gym_days: bodyData.selectedDays.length,
      time_per_session: SESSION_HOURS[bodyData.sessionLength ?? '1hr'],
      dietary_restrictions: prefs.restrictions,
      availability,
    };

    setApiError(null);
    const res = await fetch('/api/optimise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message ?? `Server error ${res.status}`);
    }

    const data = await res.json();
    navigate('/results', { state: { apiResponse: data, formPayload: payload } });
  };

  return (
    <main className="onboarding">
      <ProgressBar currentScreen={currentScreen} totalScreens={4} />
      <div className="onboarding__card">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentScreen}
            custom={direction}
            variants={SCREEN_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={TRANSITION}
          >
            {currentScreen === 1 && (
              <ScreenGoal
                onNext={(g: GoalType) => { setGoal(g); goNext(); }}
              />
            )}
            {currentScreen === 2 && (
              <ScreenAbout
                onNext={(_data: AboutData) => goNext()}
                onBack={goBack}
              />
            )}
            {currentScreen === 3 && (
              <ScreenBody
                onNext={(data: BodyData) => { setBodyData(data); goNext(); }}
                onBack={goBack}
                goal={goal}
              />
            )}
            {currentScreen === 4 && (
              <ScreenPreferences
                onBack={goBack}
                onSubmit={handleSubmit}
                error={apiError}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
