import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import ProjectsSection from '../components/ProjectSections';
import CompaniesSection from '../components/CompaniesSection';
import Footer from '../components/Footer';

const Home = () => (
  <div>
    <Header />
    <main>
      <Hero />
      <About />
      <ProjectsSection />
      <CompaniesSection />
    </main>
    <Footer />
  </div>
);

export default Home;