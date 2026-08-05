import SectionTitle from '../custom/SectionTitle';
import { usePreferences } from '../../context/PreferencesContext';

const AboutSection = () => {
  const { content } = usePreferences();
  const { about } = content;

  return (
    <section id="about" className="content-section about-section section-anchor">
      <SectionTitle eyebrow={about.eyebrow} title={about.title} />
      <div className="about-layout">
        <div className="about-copy reveal-card is-visible">
          <p>{about.body}</p>
          <p>{about.bodyTwo}</p>
        </div>
        <div className="stats-stack">
          {about.stats.map((stat, index) => (
            <article className="stat-card" key={stat.label} style={{ '--delay': `${index * 90}ms` }}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
