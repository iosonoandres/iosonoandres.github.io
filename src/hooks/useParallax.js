import { useEffect, useState } from 'react';
import usePrefersReducedMotion from './usePrefersReducedMotion';

const useParallax = (intensity = 20) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (prefersReducedMotion) {
      setOffset({ x: 0, y: 0 });
      return undefined;
    }

    const onPointerMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * intensity;
      const y = (event.clientY / window.innerHeight - 0.5) * intensity;
      setOffset({ x, y });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [intensity, prefersReducedMotion]);

  return offset;
};

export default useParallax;
