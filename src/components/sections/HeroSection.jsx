import AnimatedBackground from '../custom/AnimatedBackground';
import { usePreferences } from '../../context/PreferencesContext';
import heroPortrait from '../../assets/portfolio/andres-portrait.jpg';

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

const HeroSection = () => {
  const { content, shared } = usePreferences();

  return (
    <section id="home" className="hero-section section-anchor" aria-labelledby="hero-title">
      <AnimatedBackground />
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="hero-kicker"><span />{content.hero.kicker}</p>
          <h1 id="hero-title">
            <span>Andres</span>
            <span className="hero-name-accent">Camacho</span>
          </h1>
          <p className="hero-role">{content.hero.role}</p>
          <p className="hero-statement">{content.hero.statement}</p>
          <div className="hero-status"><i />{content.hero.status}</div>
          <div className="hero-actions">
            <a className="action-button action-primary" href={shared.links.cv} download>
              {content.hero.download}<ArrowIcon />
            </a>
            <a className="action-button action-secondary" href="#contact">
              {content.hero.contact}
            </a>
          </div>
        </div>

        <div className="portrait-stage">
          <div className="portrait-orbit orbit-one" />
          <div className="portrait-orbit orbit-two" />
          <div className="portrait-card">
            <span className="portrait-index">01 / PORTFOLIO</span>
            <img src={heroPortrait} alt="Andres Camacho" loading="eager" />
            <span className="portrait-caption">ARCHITECTURE × AI</span>
          </div>
          <span className="floating-code code-a">LOCAL / CLOUD</span>
          <span className="floating-code code-b">BUILD · TEACH · LEAD</span>
        </div>
      </div>
      <a className="scroll-cue" href="#about"><span>{content.hero.scroll}</span><i /></a>
    </section>
  );
};

export default HeroSection;
