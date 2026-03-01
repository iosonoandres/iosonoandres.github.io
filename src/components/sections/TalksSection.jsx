import React from 'react';
import GlowCard from '../custom/GlowCard';
import SectionTitle from '../custom/SectionTitle';
import { siteContent } from '../../data/siteContent';

const TalksSection = () => (
  <section id="talks" className="content-section section-anchor" aria-label="Talks and Teaching">
    <SectionTitle
      eyebrow="Talks & Teaching"
      title="Teaching, leadership, and recognition ✏️"
      description={siteContent.talks.description}
    />

    <div className="talks-grid">
      {siteContent.talks.entries.map((entry, index) => (
        <GlowCard key={`${entry.organization}-${entry.role}`} delay={index * 70}>
          <p className="timeline-date">{entry.period}</p>
          <h3>{entry.role}</h3>
          <p className="timeline-org">{entry.organization}</p>
          <p className="timeline-meta">{entry.meta}</p>
          <p>{entry.description}</p>
        </GlowCard>
      ))}

      <GlowCard delay={300}>
        <p className="timeline-date">{siteContent.talks.certification.period}</p>
        <h3>{siteContent.talks.certification.title}</h3>
        <p>{siteContent.talks.certification.description}</p>
      </GlowCard>
    </div>
  </section>
);

export default TalksSection;
