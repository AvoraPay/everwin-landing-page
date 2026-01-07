import { useEffect, useState } from "react";

export function useInViewOnce<T extends Element>(
  ref: React.RefObject<T>,
  options: IntersectionObserverInit = { threshold: 0.2 }
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.disconnect(); // once
      }
    }, options);

    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, options]);

  return inView;
}
