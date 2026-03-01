import { useEffect, useMemo, useState } from 'react';

const useActiveSection = (sectionIds) => {
  const normalizedIds = useMemo(() => sectionIds.filter(Boolean), [sectionIds]);
  const [activeSection, setActiveSection] = useState(normalizedIds[0] ?? 'home');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || normalizedIds.length === 0) {
      return undefined;
    }

    const observedElements = normalizedIds
      .map((id) => document.getElementById(id))
      .filter((element) => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-45% 0px -45% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75],
      },
    );

    observedElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [normalizedIds]);

  return activeSection;
};

export default useActiveSection;
