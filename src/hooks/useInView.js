import { useEffect, useRef, useState } from 'react';

const useInView = ({ threshold = 0.2, rootMargin = '0px 0px -10% 0px', once = true } = {}) => {
  const elementRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return undefined;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsInView(false);
          }
        });
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return { elementRef, isInView };
};

export default useInView;
