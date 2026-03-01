import React, { useRef } from 'react';
import useInView from '../../hooks/useInView';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const GlowCard = ({ as = 'article', className = '', delay = 0, children }) => {
  const { elementRef, isInView } = useInView({ threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  const cardRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const setRefs = (node) => {
    elementRef.current = node;
    cardRef.current = node;
  };

  const resetCardEffects = () => {
    const card = cardRef.current;
    if (!card) {
      return;
    }
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.style.setProperty('--glow-x', '50%');
    card.style.setProperty('--glow-y', '50%');
  };

  const onMouseMove = (event) => {
    if (prefersReducedMotion) {
      return;
    }

    const card = cardRef.current;
    if (!card) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const tiltX = (0.5 - y) * 7;
    const tiltY = (x - 0.5) * 7;

    card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
    card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
    card.style.setProperty('--glow-x', `${(x * 100).toFixed(1)}%`);
    card.style.setProperty('--glow-y', `${(y * 100).toFixed(1)}%`);
  };

  return React.createElement(
    as,
    {
      ref: setRefs,
      className: `glow-card reveal-card ${isInView ? 'is-visible' : ''} ${className}`.trim(),
      style: { '--reveal-delay': `${delay}ms` },
      onMouseMove,
      onMouseLeave: resetCardEffects,
    },
    children,
  );
};

export default GlowCard;
