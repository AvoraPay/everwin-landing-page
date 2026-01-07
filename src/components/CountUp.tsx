import React from "react";

type CountUpProps = {
  to: number;
  durationMs?: number;
  startOnView?: boolean;
  className?: string;
};

export function CountUp({ to, durationMs = 1100, startOnView = true, className }: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = React.useState(0);
  const startedRef = React.useRef(false);

  const start = React.useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const startTs = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTs) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (to - from) * eased);

      setValue(next);
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [durationMs, to]);

  React.useEffect(() => {
    if (!startOnView) {
      start();
      return;
    }

    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) start();
      },
      { threshold: 0.3 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [start, startOnView]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
