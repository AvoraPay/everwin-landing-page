// everwin-page/src/sections/TradingSection/index.tsx
import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { TradingVisual } from "./components/TradingVisual";
import { TradingContent } from "./components/TradingContent";

function Reveal({
  children,
  delay = 0,
}: PropsWithChildren<{ delay?: number }>) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={[
        "transition-all duration-700 ease-out will-change-transform",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export const TradingSection = () => {
  return (
    <section className="relative w-full overflow-hidden pt-[120px] pb-[90px] md:pt-[140px] md:pb-[120px]">
      <div className="mx-auto w-[90%] max-w-[1120px] flex flex-col gap-14 md:flex-row md:items-center md:justify-between">
        <Reveal>
          <TradingVisual />
        </Reveal>

        <Reveal delay={120}>
          <TradingContent />
        </Reveal>
      </div>
    </section>
  );
};
