import React from 'react';
import GlowCard from '../custom/GlowCard';
import SectionTitle from '../custom/SectionTitle';
import { siteContent } from '../../data/siteContent';

const SkillsSection = () => (
  <section id="skills" className="content-section section-anchor" aria-label="Skills">
    <SectionTitle
      eyebrow="Skills"
      title="Technical skills"
      description="Core skills across engineering, data, cloud, and delivery."
    />

    <GlowCard className="skills-card">
      <div className="skills-pills" role="list" aria-label="Skills list">
        {siteContent.skills.map((skill) => (
          <span key={skill} role="listitem" className="skill-pill">
            {skill}
          </span>
        ))}
      </div>
    </GlowCard>
  </section>
);

export default SkillsSection;
