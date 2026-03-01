import React from 'react';
import GlowCard from '../custom/GlowCard';
import SectionTitle from '../custom/SectionTitle';
import { siteContent } from '../../data/siteContent';

const EducationSection = () => {
  const { education } = siteContent;

  return (
    <section id="education" className="content-section section-anchor" aria-label="Education">
      <SectionTitle eyebrow="Education" title="Academic background 👨🏼‍🎓" description={education.description} />

      <GlowCard className="education-card">
        <h3>{education.institution}</h3>
        <p>{education.degree}</p>
        <p className="timeline-date">{education.period}</p>
        <p>{education.focus}</p>
      </GlowCard>
    </section>
  );
};

export default EducationSection;
