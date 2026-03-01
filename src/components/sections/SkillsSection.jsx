import React, { useEffect, useRef, useState } from 'react';
import GlowCard from '../custom/GlowCard';
import SectionTitle from '../custom/SectionTitle';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { siteContent } from '../../data/siteContent';

const SkillsSection = () => {
  const wrapRef = useRef(null);
  const skillRefs = useRef([]);
  const [links, setLinks] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const updateLinks = () => {
      const wrap = wrapRef.current;
      if (!wrap) {
        return;
      }

      const wrapRect = wrap.getBoundingClientRect();
      const points = skillRefs.current
        .map((item) => {
          if (!item) {
            return null;
          }
          const rect = item.getBoundingClientRect();
          return {
            x: rect.left - wrapRect.left + rect.width / 2,
            y: rect.top - wrapRect.top + rect.height / 2,
          };
        })
        .filter(Boolean);

      const nextLinks = [];
      points.forEach((point, index) => {
        const target = points[index + 1];
        if (!target) {
          return;
        }

        const distance = Math.hypot(target.x - point.x, target.y - point.y);
        if (distance > 265) {
          return;
        }

        nextLinks.push({
          id: `${index}-${index + 1}`,
          from: index,
          to: index + 1,
          x1: point.x,
          y1: point.y,
          x2: target.x,
          y2: target.y,
        });
      });

      setLinks(nextLinks);
    };

    updateLinks();
    window.addEventListener('resize', updateLinks);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateLinks);
      if (wrapRef.current) {
        resizeObserver.observe(wrapRef.current);
      }
      skillRefs.current.forEach((item) => {
        if (item) {
          resizeObserver.observe(item);
        }
      });
    }

    return () => {
      window.removeEventListener('resize', updateLinks);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <section id="skills" className="content-section section-anchor" aria-label="Skills">
      <SectionTitle
        eyebrow="Skills"
        title="Technical skills"
        description="Core skills across engineering, data, cloud, and delivery."
      />

      <GlowCard className="skills-card">
        <div ref={wrapRef} className="skills-constellation-wrap">
          {!prefersReducedMotion && links.length > 0 && (
            <svg className="skills-constellation" aria-hidden="true">
              {links.map((link) => {
                const isHot = hoveredIndex === link.from || hoveredIndex === link.to;
                return (
                  <line
                    key={link.id}
                    className={`skills-constellation-line ${isHot ? 'is-hot' : ''}`}
                    x1={link.x1}
                    y1={link.y1}
                    x2={link.x2}
                    y2={link.y2}
                  />
                );
              })}
            </svg>
          )}

          <div className="skills-pills" role="list" aria-label="Skills list">
            {siteContent.skills.map((skill, index) => (
              <span
                key={skill}
                ref={(node) => {
                  skillRefs.current[index] = node;
                }}
                role="listitem"
                className="skill-pill"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(-1)}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </GlowCard>
    </section>
  );
};

export default SkillsSection;
