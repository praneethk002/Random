import { Target, Utensils, Calendar } from "lucide-react";
import "./FeatureCards.css";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

function FeatureCard({ icon, title, description, className = "" }: FeatureCardProps) {
  return (
    <div className={`feature-card ${className}`}>
      <div className="feature-card__header">
        <span className="feature-card__icon-wrap">{icon}</span>
        <p className="feature-card__title">{title}</p>
      </div>
      <p className="feature-card__description">{description}</p>
    </div>
  );
}

const FEATURE_CARDS: FeatureCardProps[] = [
  {
    icon: <Target className="feature-card__icon" />,
    title: "Goal-Based Optimisation",
    description: "Your plan adapts to your exact target",
    className: "feature-card--back",
  },
  {
    icon: <Utensils className="feature-card__icon" />,
    title: "Personalised Nutrition",
    description: "Optimal meals matched to your macros",
    className: "feature-card--mid",
  },
  {
    icon: <Calendar className="feature-card__icon" />,
    title: "Smart Scheduling",
    description: "Workouts built around your availability",
    className: "feature-card--front",
  },
];

export default function FeatureCards() {
  return (
    <div className="feature-cards-grid">
      {FEATURE_CARDS.map((card) => (
        <FeatureCard key={card.title} {...card} />
      ))}
    </div>
  );
}
