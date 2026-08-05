import { usePreferences } from '../../context/PreferencesContext';

const Footer = ({ onOpenGame }) => {
  const { content, shared } = usePreferences();
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} {shared.identity.name}</p>
      <p>{content.footer}</p>
      <button type="button" onClick={onOpenGame} aria-label={content.ui.gameHint}>CLAW_01</button>
    </footer>
  );
};

export default Footer;
