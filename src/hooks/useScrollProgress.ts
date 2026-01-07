import { useEffect, useState } from "react";

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

type Options = {
  /** viewport fraction where progress starts (0..1). ex: 0.8 = 80% viewport */
  start?: number;
  /** viewport fraction where progress ends (0..1). ex: 0.2 = 20% viewport */
  end?: number;
};

export function useScrollProgress<T extends HTMLElement>(
  ref: React.RefObject<T>,
  { start = 0.8, end = 0.2 }: Options = {}
) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const update = () => {
      const y = window.scrollY || window.pageYOffset;
      const vh = window.innerHeight || document.documentElement.clientHeight;

      const rect = el.getBoundingClientRect();
      const top = rect.top + y;
      const height = Math.max(el.offsetHeight, rect.height, 1);

      const startY = top - vh * start;
      const endY = top + height - vh * end;

      const p = (y - startY) / Math.max(endY - startY, 1);
      setProgress(clamp(p));
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, start, end]);

  return progress;
}
