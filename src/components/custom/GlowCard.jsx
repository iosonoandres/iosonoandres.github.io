import React from 'react';
import useInView from '../../hooks/useInView';

const GlowCard = ({ as = 'article', className = '', delay = 0, children }) => {
  const { elementRef, isInView } = useInView({ threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

  return React.createElement(
    as,
    {
      ref: elementRef,
      className: `glow-card reveal-card ${isInView ? 'is-visible' : ''} ${className}`.trim(),
      style: { '--reveal-delay': `${delay}ms` },
    },
    children,
  );
};

export default GlowCard;
