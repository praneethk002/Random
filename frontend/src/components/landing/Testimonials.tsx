import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { fadeUp } from '../../tokens/variants';
import './Testimonials.css';

const TESTIMONIALS = [
  {
    quote:
      "I was eating 400 calories over my target without knowing. The meal plan fixed it in a week.",
    name: 'Jamie L.',
    initials: 'JL',
    tag: 'Weight Loss · 8 weeks',
    accent: 'teal' as const,
  },
  {
    quote:
      "Other apps give generic advice. This one actually ran the numbers and told me exactly what to do.",
    name: 'Marcus T.',
    initials: 'MT',
    tag: 'Muscle Gain · 12 weeks',
    accent: 'purple' as const,
  },
  {
    quote:
      "I only have 45 minutes a day to train. The model found a programme I'd never have figured out myself.",
    name: 'Priya S.',
    initials: 'PS',
    tag: 'Body Recomposition · 6 weeks',
    accent: 'teal' as const,
  },
  {
    quote:
      "I never knew how to structure a bulk. The model gave me a week-by-week breakdown I could actually follow.",
    name: 'Alex M.',
    initials: 'AM',
    tag: 'Muscle Gain · 16 weeks',
    accent: 'teal' as const,
  },
  {
    quote:
      "Lost the weight I'd been trying to shift for two years. The calorie constraints made it simple.",
    name: 'Sophie R.',
    initials: 'SR',
    tag: 'Weight Loss · 10 weeks',
    accent: 'purple' as const,
  },
  {
    quote:
      "The recomp goal is exactly what I needed. Eating at maintenance but actually changing my body composition.",
    name: 'Tom K.',
    initials: 'TK',
    tag: 'Body Recomposition · 12 weeks',
    accent: 'teal' as const,
  },
];

/* Dot accent colors alternate teal/purple per page index */
const DOT_ACCENTS = ['teal', 'purple', 'teal', 'purple', 'teal', 'purple'] as const;

function useCardsPerPage(): number {
  const getCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 900) return 3;
    if (window.innerWidth >= 600) return 2;
    return 1;
  };
  const [count, setCount] = useState(getCount);
  useEffect(() => {
    const handler = () => setCount(getCount());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return count;
}

const PAGE_VARIANTS = {
  enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
};

const PAGE_TRANSITION = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

function TestimonialCard({ quote, name, initials, tag, accent }: typeof TESTIMONIALS[number]) {
  return (
    <motion.div
      className={`testimonials__card testimonials__card--${accent}`}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <span className={`testimonials__quote-icon testimonials__quote-icon--${accent}`}>
        <Quote size={48} />
      </span>
      <p className="testimonials__quote">"{quote}"</p>
      <div className="testimonials__meta">
        <div className={`testimonials__avatar testimonials__avatar--${accent}`}>
          {initials}
        </div>
        <div className="testimonials__author">
          <span className="testimonials__name">{name}</span>
          <span className={`testimonials__tag testimonials__tag--${accent}`}>{tag}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  const cardsPerPage = useCardsPerPage();
  const totalPages = Math.ceil(TESTIMONIALS.length / cardsPerPage);

  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  /* Clamp currentPage when cardsPerPage changes (resize) */
  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages - 1));
  }, [totalPages]);

  const goTo = useCallback((page: number, dir: number) => {
    setDirection(dir);
    setCurrentPage(page);
  }, []);

  const prev = () => {
    if (currentPage > 0) goTo(currentPage - 1, -1);
  };

  const next = useCallback(() => {
    goTo((currentPage + 1) % totalPages, 1);
  }, [currentPage, totalPages, goTo]);

  /* Auto-advance */
  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [paused, next]);

  const pageCards = TESTIMONIALS.slice(
    currentPage * cardsPerPage,
    currentPage * cardsPerPage + cardsPerPage,
  );

  return (
    <section
      className="testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        className="testimonials__inner"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <p className="testimonials__label">Testimonials</p>
        <h2 className="testimonials__title">What Users Say</h2>

        {/* Slider */}
        <div className="testimonials__slider">
          <button
            className="testimonials__chevron testimonials__chevron--left"
            onClick={prev}
            aria-label="Previous page"
            style={{ visibility: currentPage === 0 ? 'hidden' : 'visible' }}
          >
            <ChevronLeft size={20} />
          </button>

          <div className="testimonials__track">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={`${currentPage}-${cardsPerPage}`}
                custom={direction}
                variants={PAGE_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={PAGE_TRANSITION}
                className="testimonials__page"
                style={{ gridTemplateColumns: `repeat(${cardsPerPage}, 1fr)` }}
              >
                {pageCards.map((t) => (
                  <TestimonialCard key={t.name} {...t} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            className="testimonials__chevron testimonials__chevron--right"
            onClick={next}
            aria-label="Next page"
            style={{ visibility: currentPage === totalPages - 1 ? 'hidden' : 'visible' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dots — one per page */}
        <div className="testimonials__dots">
          {Array.from({ length: totalPages }, (_, i) => {
            const accent = DOT_ACCENTS[i % DOT_ACCENTS.length];
            const isActive = i === currentPage;
            return (
              <motion.button
                key={i}
                className={`testimonials__dot testimonials__dot--${accent}${isActive ? ' testimonials__dot--active' : ''}`}
                onClick={() => goTo(i, i > currentPage ? 1 : -1)}
                aria-label={`Go to page ${i + 1}`}
                animate={{ scale: isActive ? 1.2 : 1 }}
                transition={{ duration: 0.2 }}
              />
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
