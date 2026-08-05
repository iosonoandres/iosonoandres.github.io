import SectionTitle from '../custom/SectionTitle';
import GlowCard from '../custom/GlowCard';
import { usePreferences } from '../../context/PreferencesContext';

const ExperienceSection = () => {
  const { content } = usePreferences();
  const { experience } = content;

  return (
    <section id="experience" className="content-section experience-section section-anchor">
      <SectionTitle eyebrow={experience.eyebrow} title={experience.title} description={experience.description} />
      <div className="experience-list">
        {experience.entries.map((entry, index) => (
          <GlowCard key={entry.organization} className="experience-card" delay={index * 120}>
            <div className="experience-rail">
              <span>0{index + 1}</span><i />
            </div>
            <div className="experience-body">
              <div className="experience-heading">
                <div>
                  <p className="experience-period">{entry.period}</p>
                  <h3>{entry.role}</h3>
                  <p className="experience-org">{entry.organization} · {entry.meta}</p>
                </div>
                {entry.marker && <span className="current-pill">{entry.marker}</span>}
              </div>
              <p className="experience-summary">{entry.summary}</p>
              <div className="experience-highlights">
                {entry.highlights.map((highlight, highlightIndex) => (
                  <p key={highlight}><span>0{highlightIndex + 1}</span>{highlight}</p>
                ))}
              </div>
              <div className="tag-row">{entry.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
          </GlowCard>
        ))}
      </div>
    </section>
  );
};

export default ExperienceSection;
