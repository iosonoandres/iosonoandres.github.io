import React, { Suspense, lazy } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/sections/HeroSection';

const AboutSection = lazy(() => import('./components/sections/AboutSection'));
const ExperienceSection = lazy(() => import('./components/sections/ExperienceSection'));
const ProjectsSection = lazy(() => import('./components/sections/ProjectsSection'));
const EducationSection = lazy(() => import('./components/sections/EducationSection'));
const TalksSection = lazy(() => import('./components/sections/TalksSection'));
const SkillsSection = lazy(() => import('./components/sections/SkillsSection'));
const ContactSection = lazy(() => import('./components/sections/ContactSection'));

const SectionFallback = () => (
  <section className="content-section skeleton-section" aria-hidden="true">
    <div className="skeleton-title" />
    <div className="skeleton-line" />
    <div className="skeleton-line short" />
  </section>
);

const Home = () => (
  <div className="site-shell">
    <Navbar />
    <main>
      <HeroSection />
      <Suspense fallback={<SectionFallback />}>
        <AboutSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ExperienceSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ProjectsSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <EducationSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <TalksSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <SkillsSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ContactSection />
      </Suspense>
    </main>
    <Footer />
  </div>
);

export default Home;
