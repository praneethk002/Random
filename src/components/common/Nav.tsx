import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Nav.css';

interface NavLink {
  label: string;
  sectionId: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'How It Works', sectionId: 'how-it-works' },
  { label: 'Testimonials', sectionId: 'testimonials' },
  { label: 'Roadmap',      sectionId: 'roadmap' },
  { label: 'FAQ',          sectionId: 'faq' },
  { label: 'Pricing',      sectionId: 'pricing' },
];

const SECTION_IDS = NAV_LINKS.map((l) => l.sectionId);

export default function Nav() {
  const [activeSection, setActiveSection] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="nav">
        <Link to="/" className="nav__logo">
          <span className="nav__logo-opti">Opti</span>
          <span className="nav__logo-fit">Fit</span>
        </Link>

        <ul className="nav__links">
          {NAV_LINKS.map(({ label, sectionId }) => {
            const isActive = activeSection === sectionId;
            return (
              <li key={sectionId}>
                <button
                  type="button"
                  className={`nav__link${isActive ? ' nav__link--active' : ''}`}
                  onClick={() => scrollTo(sectionId)}
                >
                  {isActive && <span className="nav__link-dot" aria-hidden="true" />}
                  {label}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="nav__right">
          <Link to="/onboarding" className="nav__cta">
            <ArrowRight size={14} />
            Try OptiFit
          </Link>
          <button
            type="button"
            className={`nav__hamburger${menuOpen ? ' nav__hamburger--open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className="nav__hamburger-line" />
            <span className="nav__hamburger-line" />
            <span className="nav__hamburger-line" />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="nav__mobile-menu">
          {NAV_LINKS.map(({ label, sectionId }) => (
            <button
              key={sectionId}
              type="button"
              className="nav__mobile-link"
              onClick={() => scrollTo(sectionId)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
