import React from 'react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const particles = [
  { top: '10%', left: '15%', delay: '0s' },
  { top: '18%', left: '72%', delay: '0.8s' },
  { top: '35%', left: '28%', delay: '1.4s' },
  { top: '44%', left: '88%', delay: '2.2s' },
  { top: '57%', left: '12%', delay: '1s' },
  { top: '68%', left: '64%', delay: '2.6s' },
  { top: '76%', left: '36%', delay: '0.5s' },
  { top: '82%', left: '84%', delay: '1.8s' },
];

const AnimatedBackground = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="animated-background" aria-hidden="true">
      <div className="bg-grid" />
      <div className="bg-blob blob-a" />
      <div className="bg-blob blob-b" />
      <div className="bg-blob blob-c" />
      <div className="bg-radial" />
      {!prefersReducedMotion &&
        particles.map((particle) => (
          <span
            key={`${particle.top}-${particle.left}`}
            className="bg-particle"
            style={{ top: particle.top, left: particle.left, animationDelay: particle.delay }}
          />
        ))}
    </div>
  );
};

export default AnimatedBackground;
