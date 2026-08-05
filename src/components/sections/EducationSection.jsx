import SectionTitle from '../custom/SectionTitle';
import { usePreferences } from '../../context/PreferencesContext';

const EducationSection = () => {
  const { content } = usePreferences();
  const { education } = content;

  return (
    <section id="education" className="content-section education-section section-anchor">
      <SectionTitle eyebrow={education.eyebrow} title={education.title} />
      <article className="education-panel">
        <div className="education-year">1088</div>
        <div>
          <p className="education-period">{education.period}</p>
          <h3>{education.institution}</h3>
          <h4>{education.degree}</h4>
          <p>{education.text}</p>
        </div>
      </article>
    </section>
  );
};

export default EducationSection;
