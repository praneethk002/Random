import { useState } from 'react';
import { motion } from 'motion/react';
import './FAQ.css';

const FAQS = [
  {
    q: 'How does the optimisation model actually work?',
    a: 'We use a Gurobi linear programme that takes your goal, body stats, available days, and dietary preferences as hard constraints. The solver finds the mathematically optimal meal plan and workout schedule — not estimated, not averaged. Optimal.',
  },
  {
    q: "What's the difference between the three goal modes?",
    a: 'Weight Loss runs a calorie deficit model minimising weeks to target. Muscle Gain runs a surplus model maximising lean mass gain rate. Body Recomposition targets maintenance calories with high protein and resistance training priority — simultaneously minimising fat while maximising muscle.',
  },
  {
    q: 'How accurate is the weekly meal plan?',
    a: 'Every meal is costed against macro targets set as hard constraints — protein, carbs, and fat are never violated. Calorie targets come from the Harris-Benedict equation personalised to your stats and activity level.',
  },
  {
    q: 'Can I adjust the plan after I receive it?',
    a: 'The current version generates a fixed optimal plan. In Phase 3, our AI Coach will detect deviations and re-run the optimiser automatically when you miss sessions or hit plateaus.',
  },
  {
    q: 'How does the 7-day free trial work?',
    a: "You get full access to OptiFit for 7 days with no payment required. After the trial, it's £4.99 per month. Cancel any time — no lock-in, no hidden fees.",
  },
  {
    q: 'Will it work for my dietary restrictions?',
    a: 'Yes. Vegetarian, Vegan, Gluten-Free, Dairy-Free, and Halal restrictions are all hard constraints in the model. Foods you avoid are excluded entirely — the solver works around them.',
  },
];

interface FAQItemProps {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, open, onToggle }: FAQItemProps) {
  return (
    <div className={`faq-item${open ? ' faq-item--open' : ''}`}>
      <button className="faq-item__trigger" onClick={onToggle} aria-expanded={open}>
        <span className="faq-item__question">{question}</span>
        <span className="faq-item__icon" aria-hidden="true">+</span>
      </button>
      <div className="faq-item__body" style={{ maxHeight: open ? '200px' : '0' }}>
        <p className="faq-item__answer">{answer}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number>(0);

  const toggle = (i: number) => setOpenIdx((prev) => (prev === i ? -1 : i));

  return (
    <section className="faq" id="faq">
      <motion.div
        className="faq__inner"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="faq__header">
          <p className="faq__eyebrow">FAQs</p>
          <h2 className="faq__title">Everything You Need to Know</h2>
          <p className="faq__subtitle">How OptiFit's optimisation engine works, answered.</p>
        </div>

        <div className="faq__accordion">
          {FAQS.map(({ q, a }, i) => (
            <FAQItem
              key={i}
              question={q}
              answer={a}
              open={openIdx === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
