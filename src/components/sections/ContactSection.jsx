import React from 'react';
import NeonButton from '../custom/NeonButton';
import SectionTitle from '../custom/SectionTitle';
import { siteContent } from '../../data/siteContent';

const ContactSection = () => (
  <section id="contact" className="content-section section-anchor" aria-label="Contact">
    <SectionTitle
      eyebrow="Contact"
      title="Let's build something valuable 📈"
      description="Open to conversations about software engineering, data platforms, AI initiatives, and enterprise delivery."
    />

    <div className="contact-box">
      <a href={`mailto:${siteContent.links.email}`} className="contact-link">
        {siteContent.links.email}
      </a>
      <a href={siteContent.links.linkedin} className="contact-link" target="_blank" rel="noopener noreferrer">
        linkedin.com/in/andres-camacho-881319188/
      </a>

      <NeonButton href={`mailto:${siteContent.links.email}`} variant="primary" aria-label="Send email">
        Let's talk
      </NeonButton>
    </div>
  </section>
);

export default ContactSection;
