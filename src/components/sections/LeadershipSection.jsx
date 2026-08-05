import GlowCard from '../custom/GlowCard';
import SectionTitle from '../custom/SectionTitle';
import { usePreferences } from '../../context/PreferencesContext';
import expoImage from '../../assets/stories/expo-dubai.jpg';
import openClawEnterprise from '../../assets/stories/openclaw-enterprise.jpg';

const LeadershipSection = () => {
  const { content } = usePreferences();
  const { leadership } = content;

  return (
    <section id="leadership" className="content-section leadership-section section-anchor">
      <SectionTitle eyebrow={leadership.eyebrow} title={leadership.title} description={leadership.description} />
      <div className="leadership-grid">
        {leadership.cards.map((card, index) => (
          <GlowCard key={card.index} className={`leadership-card accent-${card.accent}`} delay={index * 80}>
            <div className="card-number">{card.index}</div>
            <div>
              <p className="card-meta">{card.organization} · {card.period}</p>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </div>
          </GlowCard>
        ))}
      </div>
      <article className="innovation-feature">
        <div className="innovation-copy">
          <p>{leadership.innovation.label}</p>
          <h3>{leadership.innovation.title}</h3>
          <span>{leadership.innovation.text}</span>
          <div className="innovation-tags">
            {leadership.innovation.tags.map((tag) => <i key={tag}>{tag}</i>)}
          </div>
        </div>
        <figure><img src={openClawEnterprise} alt={leadership.innovation.imageAlt} loading="lazy" /></figure>
      </article>
      <aside className="recognition-banner">
        <figure><img src={expoImage} alt={leadership.recognition.imageAlt} loading="lazy" /></figure>
        <div>
          <p>{leadership.recognition.label}</p>
          <h3>{leadership.recognition.title}</h3>
          <span>{leadership.recognition.text}</span>
        </div>
      </aside>
    </section>
  );
};

export default LeadershipSection;
