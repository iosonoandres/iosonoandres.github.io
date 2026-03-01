import { useRef } from 'react';
import usePrefersReducedMotion from './usePrefersReducedMotion';

const useMagnetic = (strength = 16) => {
  const elementRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const onMouseMove = (event) => {
    if (prefersReducedMotion || !elementRef.current) {
      return;
    }

    const bounds = elementRef.current.getBoundingClientRect();
    const offsetX = event.clientX - (bounds.left + bounds.width / 2);
    const offsetY = event.clientY - (bounds.top + bounds.height / 2);

    const translateX = (offsetX / bounds.width) * strength;
    const translateY = (offsetY / bounds.height) * strength;

    elementRef.current.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
  };

  const onMouseLeave = () => {
    if (!elementRef.current) {
      return;
    }
    elementRef.current.style.transform = 'translate3d(0, 0, 0)';
  };

  return {
    elementRef,
    onMouseMove,
    onMouseLeave,
  };
};

export default useMagnetic;
