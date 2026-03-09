import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import ProgressBar from '../components/onboarding/ProgressBar';
import ScreenGoal, { type GoalType } from '../components/onboarding/ScreenGoal';
import ScreenAbout, { type AboutData } from '../components/onboarding/ScreenAbout';
import ScreenBody, { type BodyData } from '../components/onboarding/ScreenBody';
import ScreenPreferences from '../components/onboarding/ScreenPreferences';
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
  const [currentScreen, setCurrentScreen] = useState(1);
  const [direction, setDirection] = useState(1);
  const [goal, setGoal] = useState<GoalType | null>(null);
  const [_bodyData, setBodyData] = useState<BodyData | null>(null);

  const goNext = () => {
    setDirection(1);
    setCurrentScreen((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentScreen((s) => s - 1);
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
                onSubmit={() => {
                  /* Praneeth wires API call here */
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
