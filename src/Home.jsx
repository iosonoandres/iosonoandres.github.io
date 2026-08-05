import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/sections/HeroSection';
import OpenClawGame from './components/easter-egg/OpenClawGame';

const AboutSection = lazy(() => import('./components/sections/AboutSection'));
const ExperienceSection = lazy(() => import('./components/sections/ExperienceSection'));
const LeadershipSection = lazy(() => import('./components/sections/LeadershipSection'));
const EducationSection = lazy(() => import('./components/sections/EducationSection'));
const SkillsSection = lazy(() => import('./components/sections/SkillsSection'));
const ContactSection = lazy(() => import('./components/sections/ContactSection'));

const SectionFallback = () => <section className="content-section skeleton-section" aria-hidden="true"><i /><i /><i /></section>;

const Home = () => {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const secretRef = useRef('');
  const openGame = useCallback(() => setIsGameOpen(true), []);
  const closeGame = useCallback(() => setIsGameOpen(false), []);

  useEffect(() => {
    const onPointerMove = (event) => {
      document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
    };
    const onKeyDown = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      secretRef.current = `${secretRef.current}${event.key.toLowerCase()}`.slice(-4);
      if (secretRef.current === 'claw') {
        openGame();
        secretRef.current = '';
      }
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [openGame]);

  return (
    <div className="site-shell">
      <div className="cursor-light" aria-hidden="true" />
      <Navbar onOpenGame={openGame} />
      <main>
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <AboutSection />
          <ExperienceSection />
          <LeadershipSection />
          <EducationSection />
          <SkillsSection />
          <ContactSection />
        </Suspense>
      </main>
      <Footer onOpenGame={openGame} />
      <OpenClawGame isOpen={isGameOpen} onClose={closeGame} />
    </div>
  );
};

export default Home;
