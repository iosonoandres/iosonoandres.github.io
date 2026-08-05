import { useState } from 'react';
import useActiveSection from '../../hooks/useActiveSection';
import { usePreferences } from '../../context/PreferencesContext';
import openClawSprite from '../../assets/game/openclaw-sprite.png';

const Navbar = ({ onOpenGame }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { content, language, theme, toggleLanguage, toggleTheme, shared } = usePreferences();
  const activeSection = useActiveSection(content.nav.map(({ id }) => id));
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="navbar-shell">
      <div className="navbar-inner">
        <a href="#home" className="brand-logo" onClick={closeMenu} aria-label="Home">
          <img className="brand-mark" src="/brand-mark.jpg" alt="" />
          <small>{shared.identity.name}</small>
        </a>

        <nav id="primary-navigation" className={`nav-links ${isOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {content.nav.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`nav-link ${activeSection === link.id ? 'is-active' : ''}`}
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-controls">
          <button className="preference-toggle language-toggle" type="button" onClick={toggleLanguage} aria-label={content.ui.language}>
            <span className={language === 'en' ? 'is-selected' : ''}>EN</span>
            <span className={language === 'it' ? 'is-selected' : ''}>IT</span>
          </button>
          <button className="preference-toggle theme-toggle" type="button" onClick={toggleTheme} aria-label={theme === 'light' ? content.ui.dark : content.ui.light}>
            <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
          </button>
          <button className="claw-nav-trigger" type="button" onClick={onOpenGame} aria-label={content.ui.gameHint} title={content.ui.gameHint}>
            <img src={openClawSprite} alt="" />
          </button>
          <a className="nav-contact" href="#contact">{content.ui.talk}</a>
          <button
            type="button"
            className={`menu-toggle ${isOpen ? 'is-open' : ''}`}
            aria-expanded={isOpen}
            aria-controls="primary-navigation"
            aria-label={isOpen ? content.ui.close : content.ui.menu}
            onClick={() => setIsOpen((current) => !current)}
          >
            <span /><span />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
