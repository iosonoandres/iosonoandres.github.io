import React from 'react';
import profilePic from '../src/assets/IMG_6417.jpg';
import '../src/header.css';

const Header = () => {
  return (
    <header>
      {/* Se hai un logo o un avatar */}
      <div className="header-left">
      <img src={profilePic} alt="Profilo" />
        <h2>Andres Camacho</h2> 
        {/* Oppure un tuo nome / logo */}
      </div>

      <nav>
        <ul>
          <li><a href="#about">About Me</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#tools">Tools</a></li>
          <li><a href="#companies">Companies</a></li>
        </ul>
      </nav>

      <button className="button-connect">
        Let’s Connect
      </button>
    </header>
  );
};

export default Header;