import SectionTitle from '../custom/SectionTitle';
import { usePreferences } from '../../context/PreferencesContext';

const ContactSection = () => {
  const { content, shared } = usePreferences();
  const { contact } = content;

  return (
    <section id="contact" className="content-section contact-section section-anchor">
      <div className="contact-glow" aria-hidden="true" />
      <SectionTitle eyebrow={contact.eyebrow} title={contact.title} description={contact.text} />
      <div className="contact-actions">
        <a className="contact-main" href={`mailto:${shared.links.email}`}>{contact.email}<span>↗</span></a>
        <a className="contact-secondary" href={shared.links.linkedin} target="_blank" rel="noopener noreferrer">{contact.linkedin}<span>↗</span></a>
      </div>
      <a className="contact-email" href={`mailto:${shared.links.email}`}>{shared.links.email}</a>
    </section>
  );
};

export default ContactSection;
