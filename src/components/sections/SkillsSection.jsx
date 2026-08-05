import SectionTitle from '../custom/SectionTitle';
import { usePreferences } from '../../context/PreferencesContext';

const SkillsSection = () => {
  const { content, shared } = usePreferences();

  return (
    <section id="skills" className="content-section skills-section section-anchor">
      <SectionTitle eyebrow={content.skills.eyebrow} title={content.skills.title} description={content.skills.description} />
      <div className="capability-grid">
        {shared.skills.map((group, index) => (
          <article className="capability-group" key={group.label}>
            <span>0{index + 1}</span>
            <h3>{group.label}</h3>
            <div>{group.items.map((item) => <p key={item}>{item}</p>)}</div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default SkillsSection;
