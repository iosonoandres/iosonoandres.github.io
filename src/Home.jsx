import React, { Suspense, lazy, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/sections/HeroSection';
import ScrollLedRail from './components/custom/ScrollLedRail';
import CommandPalette from './components/custom/CommandPalette';

const AboutSection = lazy(() => import('./components/sections/AboutSection'));
const ExperienceSection = lazy(() => import('./components/sections/ExperienceSection'));
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

const Home = () => {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const tracked = new WeakSet();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-signed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.28, rootMargin: '0px 0px -8% 0px' },
    );

    const observeSections = () => {
      document.querySelectorAll('.hero-section, .content-section').forEach((section) => {
        if (tracked.has(section)) {
          return;
        }
        tracked.add(section);
        observer.observe(section);
      });
    };

    observeSections();

    const main = document.querySelector('main');
    const mutationObserver = new MutationObserver(observeSections);
    if (main) {
      mutationObserver.observe(main, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <div className="site-shell">
      <Navbar />
      <CommandPalette />
      <ScrollLedRail />
      <main>
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <AboutSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <ExperienceSection />
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
};

export default Home;
