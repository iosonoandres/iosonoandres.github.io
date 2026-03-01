import React, { useState } from 'react';
import NeonButton from '../custom/NeonButton';
import useActiveSection from '../../hooks/useActiveSection';
import { siteContent } from '../../data/siteContent';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sectionIds = siteContent.nav.map((item) => item.id);
  const activeSection = useActiveSection(sectionIds);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="navbar-shell">
      <div className="navbar-inner">
        <a href="#home" className="brand-logo" onClick={closeMenu} aria-label="Go to Home section">
          <span>AC</span>
          <small>Andres Camacho</small>
        </a>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={isOpen}
          aria-label="Open or close menu"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${isOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {siteContent.nav.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`nav-link ${isActive ? 'is-active' : ''}`}
                onClick={closeMenu}
              >
                {link.label}
              </a>
            );
          })}
          <NeonButton href="#contact" className="nav-cta" onClick={closeMenu}>
            Let's talk
          </NeonButton>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
