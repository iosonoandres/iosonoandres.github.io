import React from 'react';
import SectionTitle from '../custom/SectionTitle';
import Timeline from '../custom/Timeline';
import { siteContent } from '../../data/siteContent';

const ExperienceSection = () => (
  <section id="experience" className="content-section section-anchor" aria-label="Experience">
    <SectionTitle
      eyebrow="Experience"
      title="Professional journey"
      description="Experience across enterprise delivery, education, and mentorship with a data-driven approach."
    />
    <Timeline items={siteContent.experience} />
  </section>
);

export default ExperienceSection;
