import React from 'react';

const ProjectCard = ({ title, description, imageUrl, link }) => (
  <div className="project-card">
    {imageUrl && <img src={imageUrl} alt={title} />}
    <h3>{title}</h3>
    <p>{description}</p>
    {link && (
      <a href={link} target="_blank" rel="noopener noreferrer">
        Scopri di più
      </a>
    )}
  </div>
);

export default ProjectCard;