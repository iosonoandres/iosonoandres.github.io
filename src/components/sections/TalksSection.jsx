import React from 'react';
import GlowCard from '../custom/GlowCard';
import SectionTitle from '../custom/SectionTitle';
import { siteContent } from '../../data/siteContent';

const TalksSection = () => (
  <section id="talks" className="content-section section-anchor" aria-label="Talks and Teaching">
    <SectionTitle
      eyebrow="Talks & Teaching"
      title="Teaching, leadership, and recognition"
      description="Learning initiatives and leadership experiences focused on data, AI, and cybersecurity."
    />

    <div className="talks-grid">
      <GlowCard delay={0}>
        <h3>{siteContent.talks.teaching.title}</h3>
        <ul>
          {siteContent.talks.teaching.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </GlowCard>

      <GlowCard delay={120}>
        <p className="timeline-date">{siteContent.talks.leadership.period}</p>
        <h3>{siteContent.talks.leadership.title}</h3>
        <p>{siteContent.talks.leadership.description}</p>
      </GlowCard>

      <GlowCard delay={180}>
        <p className="timeline-date">{siteContent.talks.certification.period}</p>
        <h3>{siteContent.talks.certification.title}</h3>
        <p>{siteContent.talks.certification.description}</p>
      </GlowCard>
    </div>
  </section>
);

export default TalksSection;
