import React from 'react';
import ProjectCard from './ProjectCard';

// Dati di esempio per i progetti
const projects = [
  {
    id: 1,
    title: 'Analisi dei dati di vendita',
    description: 'Progetto per identificare trend nelle vendite e ottimizzare le strategie di marketing.',
    imageUrl: 'https://via.placeholder.com/300',
    link: 'https://example.com/progetto1'
  },
  {
    id: 2,
    title: 'ETL Pipeline',
    description: 'Costruzione di una pipeline ETL per processare grandi quantità di dati in tempo reale.',
    imageUrl: 'https://via.placeholder.com/300',
    link: 'https://example.com/progetto2'
  },
];

const ProjectsSection = () => (
  <section id="projects">
    <h2>Progetti</h2>
    <div className="projects-grid">
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          title={project.title}
          description={project.description}
          imageUrl={project.imageUrl}
          link={project.link}
        />
      ))}
    </div>
  </section>
);

export default ProjectsSection;