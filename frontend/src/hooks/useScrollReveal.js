import { useEffect, useRef, useState } from 'react';

/**
 * Reveals an element (fade + slight rise) the first time it enters the
 * viewport. Uses IntersectionObserver, never a scroll listener, so it never
 * touches React state on every scroll frame. Reduced-motion visitors get the
 * content immediately with no transform.
 */
export function useScrollReveal(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, className: visible ? 'reveal-in' : 'reveal-pending' };
}
