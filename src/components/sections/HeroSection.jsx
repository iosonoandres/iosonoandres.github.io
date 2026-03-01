import React from 'react';
import AnimatedBackground from '../custom/AnimatedBackground';
import NeonButton from '../custom/NeonButton';
import MagneticLink from '../custom/MagneticLink';
import useParallax from '../../hooks/useParallax';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { siteContent } from '../../data/siteContent';
import heroPortrait from '../../assets/IMG_6417-Photoroom.png';

const HeroSection = () => {
  const { identity, links } = siteContent;
  const parallax = useParallax(24);
  const prefersReducedMotion = usePrefersReducedMotion();

  const heroStyle = prefersReducedMotion
    ? undefined
    : {
        transform: `translate3d(${parallax.x * 0.22}px, ${parallax.y * 0.12}px, 0)`,
      };
  const portraitStyle = prefersReducedMotion
    ? undefined
    : {
        transform: `translate3d(${parallax.x * -0.14}px, ${parallax.y * -0.08}px, 0)`,
      };

  return (
    <section id="home" className="hero-section section-anchor" aria-label="Hero">
      <AnimatedBackground />
      <div className="hero-inner">
        <div className="hero-content" style={heroStyle}>
          <p className="hero-kicker">{identity.location}</p>
          <h1>{identity.name}</h1>
          <p className="hero-headline">{identity.headline}</p>

          <div className="hero-actions">
            <NeonButton href={links.cv} download variant="primary" aria-label="Download CV">
              Download CV
            </NeonButton>
            <NeonButton href="#contact" variant="ghost" aria-label="Go to contact section">
              Contact me
            </NeonButton>
          </div>

          <div className="hero-links">
            <MagneticLink href={links.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </MagneticLink>
          </div>
        </div>

        <div className="hero-visual-stage" style={portraitStyle} aria-hidden="true">
          <div className="hero-portrait">
            <img src={heroPortrait} alt="" loading="eager" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
