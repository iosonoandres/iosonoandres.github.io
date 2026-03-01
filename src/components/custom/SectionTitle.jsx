import React from 'react';
import useInView from '../../hooks/useInView';

const SectionTitle = ({ eyebrow, title, description }) => {
  const { elementRef, isInView } = useInView({ threshold: 0.25 });

  return (
    <header ref={elementRef} className={`section-title reveal-card ${isInView ? 'is-visible' : ''}`}>
      {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </header>
  );
};

export default SectionTitle;
