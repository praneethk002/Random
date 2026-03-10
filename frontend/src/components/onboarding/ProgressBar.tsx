import './ProgressBar.css';

interface ProgressBarProps {
  currentScreen: number;  // 1-indexed (1–4)
  totalScreens?: number;  // defaults to 4
}

export default function ProgressBar({ currentScreen, totalScreens = 4 }: ProgressBarProps) {
  return (
    <div
      className="progress-bar"
      role="progressbar"
      aria-valuenow={currentScreen}
      aria-valuemax={totalScreens}
    >
      {Array.from({ length: totalScreens }, (_, i) => (
        <div
          key={i}
          className={`progress-bar__segment${i < currentScreen ? ' progress-bar__segment--filled' : ''}`}
        />
      ))}
    </div>
  );
}
