import { motion } from 'motion/react';
import Button from '../common/Button';
import { fadeUp } from '../../tokens/variants';
import './FooterCTA.css';

export default function FooterCTA() {
  return (
    <>
      <section className="footer-cta">
        <motion.div
          className="footer-cta__inner"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="footer-cta__title">Ready to build your plan?</h2>
          <p className="footer-cta__subtitle">
            Mathematically optimal. Built for your body.
          </p>
          <Button href="/onboarding" variant="primary" className="footer-cta__btn">
            Get Started Free →
          </Button>
        </motion.div>
      </section>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <span className="site-footer__logo">
            <span className="site-footer__logo-opti">Opti</span>
            <span className="site-footer__logo-fit">Fit</span>
          </span>
          <span className="site-footer__copy">
            © 2026 OptiFit · Decision Analytics &amp; Modelling
          </span>
        </div>
      </footer>
    </>
  );
}
