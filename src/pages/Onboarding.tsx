import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import ProgressBar from '../components/onboarding/ProgressBar';
import ScreenGoal, { type GoalType } from '../components/onboarding/ScreenGoal';
import ScreenAbout, { type AboutData } from '../components/onboarding/ScreenAbout';
import ScreenBody, { type BodyData } from '../components/onboarding/ScreenBody';
import ScreenPreferences from '../components/onboarding/ScreenPreferences';
import type { FitnessRequest } from '../types/api';
import './Onboarding.css';

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
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [bodyData, setBodyData] = useState<BodyData | null>(null);

  const goNext = () => {
    setDirection(1);
    setCurrentScreen((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentScreen((s) => s - 1);
  };

  const handleSubmit = async (
    restrictions: string[],
    avoidTags: string[],
    enjoyTags: string[],
  ) => {
    if (!goal || !aboutData || !bodyData) return;

    const payload: FitnessRequest = {
      goal,
      sex: aboutData.sex ?? 'male',
      age: parseInt(aboutData.age, 10),
      height_cm: parseFloat(aboutData.height),
      activity_level: aboutData.activityLevel ?? '3-4',
      start_weight_kg: parseFloat(bodyData.startWeight),
      target_weight_kg: parseFloat(bodyData.targetWeight),
      weeks: parseInt(bodyData.weeks, 10),
      gym_days: bodyData.selectedDays.map((d) => d.toLowerCase()),
      session_length: bodyData.sessionLength ?? '1hr',
      dietary_restrictions: restrictions,
      foods_avoid: avoidTags,
      foods_enjoy: enjoyTags,
    };

    const response = await fetch('/api/fitness-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error ?? `HTTP ${response.status}`);
    }

    const data = await response.json();
    navigate('/results', { state: { data } });
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
                onNext={(data: AboutData) => { setAboutData(data); goNext(); }}
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
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
