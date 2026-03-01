import React, { useEffect, useMemo, useState } from 'react';
import useInView from '../../hooks/useInView';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const EASE_OUT_CUBIC = (value) => 1 - (1 - value) ** 3;

const AchievementCounters = ({ items = [] }) => {
  const { elementRef, isInView } = useInView({ threshold: 0.28, rootMargin: '0px 0px -6% 0px' });
  const prefersReducedMotion = usePrefersReducedMotion();
  const targetValues = useMemo(() => items.map((item) => item.value), [items]);
  const [counts, setCounts] = useState(() => targetValues.map(() => 0));

  useEffect(() => {
    if (targetValues.length === 0) {
      return undefined;
    }

    if (!isInView) {
      return undefined;
    }

    if (prefersReducedMotion) {
      setCounts(targetValues);
      return undefined;
    }

    const duration = 1300;
    const start = performance.now();
    let frameId = 0;

    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = EASE_OUT_CUBIC(progress);
      setCounts(targetValues.map((target) => Math.round(target * eased)));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isInView, prefersReducedMotion, targetValues]);

  return (
    <div ref={elementRef} className={`achievement-grid reveal-card ${isInView ? 'is-visible' : ''}`}>
      {items.map((item, index) => (
        <article key={item.label} className="achievement-card">
          <p className="achievement-value">
            {counts[index]}
            {item.suffix}
          </p>
          <p className="achievement-label">{item.label}</p>
        </article>
      ))}
    </div>
  );
};

export default AchievementCounters;
