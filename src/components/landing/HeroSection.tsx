import { motion } from 'motion/react';
import Button from '../common/Button';
import HeroOrbit from './HeroOrbit';
import ShootingStars from '../ShootingStars';
import StarBackground from '../StarBackground';
import { staggerContainer, staggerChild } from '../../tokens/variants';
import './HeroSection.css';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__bg-teal" aria-hidden="true" />
      <div className="hero__bg-purple" aria-hidden="true" />
      <StarBackground />
      <ShootingStars
        minSpeed={300}
        maxSpeed={500}
        minDelay={600}
        maxDelay={1800}
        starColor="#9E00FF"
        trailColor="#2EB9DF"
        starHeight={1}
      />
      <ShootingStars
        minSpeed={250}
        maxSpeed={400}
        minDelay={900}
        maxDelay={2200}
        starColor="#2EB9DF"
        trailColor="#9E00FF"
        starHeight={1}
      />
      <HeroOrbit />
      <motion.div
        className="hero__content"
        style={{ position: 'relative', zIndex: 3 }}
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="visible"
      >
        <motion.p className="hero__eyebrow" variants={staggerChild}>
          Mathematical Fitness Optimisation
        </motion.p>
        <motion.h1 className="hero__headline" variants={staggerChild}>
          Your Optimal Plan,{' '}
          <span className="hero__headline-accent">Scientifically Built</span>
        </motion.h1>
        <motion.p className="hero__subheadline" variants={staggerChild}>
          Tell us your goal. Our model finds the exact nutrition and training
          plan to get you there.
        </motion.p>
        <motion.div className="hero__ctas" variants={staggerChild}>
          <Button href="/onboarding" variant="primary">Get Your Plan →</Button>
          <Button variant="ghost" onClick={() => { document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>See How It Works</Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
