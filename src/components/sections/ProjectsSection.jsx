import React from 'react';
import GlowCard from '../custom/GlowCard';
import SectionTitle from '../custom/SectionTitle';
import { siteContent } from '../../data/siteContent';

const ProjectsSection = () => (
  <section id="projects" className="content-section section-anchor" aria-label="Projects">
    <SectionTitle
      eyebrow="Projects"
      title="Selected focus areas"
      description="Representative domains where I have recently delivered technical and operational value."
    />

    <div className="project-grid">
      {siteContent.projects.map((project, index) => (
        <GlowCard key={project.title} delay={index * 90}>
          <span className="status-pill">{project.status}</span>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
        </GlowCard>
      ))}
    </div>
  </section>
);

export default ProjectsSection;
