import React from 'react';
import GlowCard from '../custom/GlowCard';
import SectionTitle from '../custom/SectionTitle';
import AchievementCounters from '../custom/AchievementCounters';
import { siteContent } from '../../data/siteContent';

const AboutSection = () => (
  <section id="about" className="content-section section-anchor" aria-label="About">
    <SectionTitle
      eyebrow="About"
      title="Software Engineer with a Data and AI background 💻"
      description={siteContent.about.bio}
    />

    <GlowCard className="about-milestone" delay={40}>
      <h3>Milestone</h3>
      <p>{siteContent.about.milestone}</p>
    </GlowCard>

    <AchievementCounters items={siteContent.about.counters} />

    <div className="focus-grid">
      {siteContent.about.focusCards.map((card, index) => (
        <GlowCard key={card.title} delay={80 + index * 70}>
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </GlowCard>
      ))}
    </div>
  </section>
);

export default AboutSection;
