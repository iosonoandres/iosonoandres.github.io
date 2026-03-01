import React, { useEffect, useState } from 'react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const ScrollLedRail = () => {
  const [progress, setProgress] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let frameId = 0;

    const updateProgress = () => {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = documentHeight > 0 ? window.scrollY / documentHeight : 0;
      setProgress(Math.min(1, Math.max(0, nextProgress)));
    };

    const onScroll = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateProgress();
      });
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <aside className={`scroll-led-rail ${prefersReducedMotion ? 'is-reduced' : ''}`} aria-hidden="true">
      <span className="scroll-led-track" />
      <span className="scroll-led-fill" style={{ transform: `scaleY(${Math.max(progress, 0.04)})` }} />
      <span className="scroll-led-dot" style={{ top: `calc(${progress * 100}% - 7px)` }} />
    </aside>
  );
};

export default ScrollLedRail;
