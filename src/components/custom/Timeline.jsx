import React from 'react';
import GlowCard from './GlowCard';

const Timeline = ({ items }) => (
  <div className="timeline" role="list">
    {items.map((item, index) => (
      <div className="timeline-node" role="listitem" key={`${item.organization}-${item.role}`}>
        <GlowCard className="timeline-card" delay={index * 90}>
          <p className="timeline-date">{item.period}</p>
          <h3>{item.role}</h3>
          <p className="timeline-org">{item.organization}</p>
          {item.meta && <p className="timeline-meta">{item.meta}</p>}
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

export default Timeline;
