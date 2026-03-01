import React, { useEffect, useRef, useState } from 'react';
import GlowCard from './GlowCard';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const Timeline = ({ items }) => {
  const timelineRef = useRef(null);
  const nodeRefs = useRef([]);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    nodeRefs.current = nodeRefs.current.slice(0, items.length);
  }, [items.length]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let frameId = 0;

    const updateTimeline = () => {
      const timeline = timelineRef.current;
      if (!timeline) {
        return;
      }

      const rect = timeline.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const start = viewportHeight * 0.2;
      const end = viewportHeight * 0.78;
      const total = rect.height + (end - start);
      const nextProgress = Math.min(1, Math.max(0, (end - rect.top) / total));
      setProgress(nextProgress);

      let nextActiveIndex = 0;
      nodeRefs.current.forEach((node, index) => {
        if (!node) {
          return;
        }
        const nodeRect = node.getBoundingClientRect();
        const nodeCenter = nodeRect.top + nodeRect.height / 2;
        if (nodeCenter <= viewportHeight * 0.52) {
          nextActiveIndex = index;
        }
      });

      setActiveIndex(nextActiveIndex);
    };

    const onScroll = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateTimeline();
      });
    };

    updateTimeline();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.cancelAnimationFrame(frameId);
    };
  }, [items.length]);

  return (
    <div
      ref={timelineRef}
      className="timeline"
      role="list"
      style={prefersReducedMotion ? undefined : { '--timeline-progress': progress.toFixed(4) }}
    >
      {items.map((item, index) => (
        <div
          ref={(node) => {
            nodeRefs.current[index] = node;
          }}
          className={`timeline-node ${index === activeIndex ? 'is-active' : ''} ${index < activeIndex ? 'is-past' : ''}`}
          role="listitem"
          key={`${item.organization}-${item.role}`}
        >
          <GlowCard className="timeline-card" delay={index * 90}>
            <p className="timeline-date">{item.period}</p>
            <h3>{item.role}</h3>
            <p className="timeline-org">{item.organization}</p>
            {item.meta && <p className="timeline-meta">{item.meta}</p>}
            {item.summary && <p className="timeline-summary">{item.summary}</p>}
            {item.bullets?.length > 0 && (
              <ul>
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </GlowCard>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
