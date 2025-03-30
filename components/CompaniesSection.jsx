import React from 'react';

// Dati di esempio per le aziende
const companies = [
  {
    id: 1,
    name: 'Azienda 1',
    logoUrl: 'https://via.placeholder.com/150'
  },
  {
    id: 2,
    name: 'Azienda 2',
    logoUrl: 'https://via.placeholder.com/150'
  },
  {
    id: 3,
    name: 'Azienda 3',
    logoUrl: 'https://via.placeholder.com/150'
  },
];

const CompaniesSection = () => (
  <section id="companies">
    <h2>Collaborazioni</h2>
    <div className="companies-grid">
      {companies.map(company => (
        <div key={company.id} className="company-card">
          <img src={company.logoUrl} alt={company.name} />
          <p>{company.name}</p>
        </div>
      ))}
    </div>
  </section>
);

export default CompaniesSection;