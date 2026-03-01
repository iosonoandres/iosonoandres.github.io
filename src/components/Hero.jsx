import React from 'react';
import '../hero.css';
import ImageRotating from '../assets/database-setting_18044711.png';

const Hero = () => {
  return (
    <section id="hero" className="hero-section">
      {/* Prima riga: testo a sinistra, immagine a destra */}
      <div className="hero-row">
        <div className="hero-text">
          <h2>La mia storia</h2>
          <p>
            Sono un Data Engineer con esperienza in progetti ETL, Data Visualization e Smart Document Analytics. 
            Ho collaborato con aziende di logistica (Bartolini) e Pubblica Amministrazione (GenAI).
          </p>
        </div>
        <div className="hero-image">
          {/* Immagine rotante come esempio */}
          <img src={ImageRotating} className="rotating" alt="Immagine dinamica" />
        </div>
      </div>

      {/* Seconda riga invertita: immagine a sinistra, testo a destra */}
      <div className="hero-row inverse">
        <div className="hero-image">
          <img src="/dataengin.jpg" alt="Visual data engineering" />
        </div>
        <div className="hero-text">
          <p>
            In questi progetti ho implementato pipeline di ingestione dati, realizzato dashboard interattive 
            e sperimentato soluzioni di smart document analytics.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
