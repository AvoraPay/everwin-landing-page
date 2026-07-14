// src/components/Reveal.tsx
import * as React from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** ms */
  delay?: number;
  /** ms */
  duration?: number;
  /** px */
  distance?: number;
  threshold?: number;
  once?: boolean;
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 700,
  distance = 18,
  threshold = 0.2,
  once = true,
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setVisible(true);
          if (once) io.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  return (
    <div
      ref={ref}
      className={[
        "will-change-transform will-change-opacity",
        "transition-[transform,opacity] ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0",
        className,
      ].join(" ")}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
        // Tailwind não gera translate-y dinâmico com template string, então garantimos via style quando hidden:
        transform: visible ? undefined : `translate3d(0, ${distance}px, 0)`,
        opacity: visible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}
