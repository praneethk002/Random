import { CheckCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { motion, type Variants } from 'motion/react';
import { COLOR_TEAL, COLOR_TEXT_MUTED } from '../../tokens/chartColors';
import './Pricing.css';

const INTEREST_DATA = [
  { month: 'Jan', interest: 65 },
  { month: 'Feb', interest: 72 },
  { month: 'Mar', interest: 68 },
  { month: 'Apr', interest: 80 },
  { month: 'May', interest: 85 },
  { month: 'Jun', interest: 90 },
  { month: 'Jul', interest: 88 },
  { month: 'Aug', interest: 95 },
  { month: 'Sep', interest: 100 },
  { month: 'Oct', interest: 105 },
  { month: 'Nov', interest: 110 },
  { month: 'Dec', interest: 120 },
];

const FREE_FEATURES = [
  'Full access to all 3 goal modes',
  'One complete meal plan + workout schedule',
  'Weight projection and sensitivity analysis',
  'No credit card required',
];

const PRO_FEATURES = [
  'Unlimited plan regenerations',
  'Goal switching at any time',
  'Priority support',
  'New features as they launch',
  'Exportable meal and workout plans',
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.15, ease: 'easeOut' as const },
  }),
};

export default function Pricing() {
  return (
    <section className="pricing">
      <div className="pricing__inner">
        <div className="pricing__header">
          <p className="pricing__label">Pricing</p>
          <h2 className="pricing__title">Simple, Honest Pricing</h2>
          <p className="pricing__subtitle">
            A personal trainer costs £50/session. A nutritionist costs
            £100/consultation. OptiFit gives you a mathematically optimal plan
            for less than a coffee a week.
          </p>
        </div>

        <div className="pricing__grid">
          {/* ── Free Trial card ── */}
          <motion.div
            className="pricing-card pricing-card--free"
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardVariants}
          >
            <p className="pricing-card__label">Free Trial</p>
            <p className="pricing-card__price">7 days free</p>
            <p className="pricing-card__description">
              Try OptiFit with no commitment
            </p>

            <ul className="pricing-card__features">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="pricing-card__feature">
                  <CheckCircle
                    className="pricing-card__check-icon"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button className="pricing-card__btn pricing-card__btn--ghost">
              Start Free Trial
            </button>
          </motion.div>

          {/* ── Pro card ── */}
          <motion.div
            className="pricing-card pricing-card--pro"
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardVariants}
          >
            {/* Pro card split into two sub-columns */}
            <div className="pricing-card--pro__left">
              <p className="pricing-card__label">Pro</p>
              <p className="pricing-card__price pricing-card__price--teal">
                £4.99 / month
              </p>
              <p className="pricing-card__description">
                Optimal plans, every week
              </p>

              <div className="pricing-chart">
                <p className="pricing-chart__heading">Growing Fast</p>
                <p className="pricing-chart__subheading">
                  Monthly interest from fitness enthusiasts
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart
                    data={INTEREST_DATA}
                    margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: '12px',
                        borderRadius: '6px',
                        border: '1px solid #E5E7EB',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="interest"
                      stroke={COLOR_TEAL}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: COLOR_TEAL }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pricing-card--pro__right">
              <p className="pricing-card__everything-label">
                Everything in Free Trial, plus:
              </p>

              <ul className="pricing-card__features">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="pricing-card__feature">
                    <CheckCircle
                      className="pricing-card__check-icon"
                      aria-hidden="true"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pricing-card__ctas">
                <button className="pricing-card__btn pricing-card__btn--primary">
                  Get Started →
                </button>
                <button className="pricing-card__btn pricing-card__btn--ghost">
                  Start Free Trial
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
