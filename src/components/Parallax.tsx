// src/components/Parallax.tsx
import React, { useEffect, useRef, useState } from "react";

export type ParallaxConfig = {
  /** deslocamento vertical em px (início -> fim) */
  y?: [number, number];
  /** escala (início -> fim) */
  scale?: [number, number];
  /** rotação em graus (início -> fim) */
  rotate?: [number, number];
};

/** Use o mesmo preset em todas as seções (incluindo HERO e essa) */
export const HERO_PARALLAX: Required<ParallaxConfig> = {
  y: [-18, 18],
  scale: [1, 1],
  rotate: [0, 0],
};

function clamp(n: number, a = 0, b = 1) {
  return Math.max(a, Math.min(b, n));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  config?: ParallaxConfig;
  disabled?: boolean;
};

/**
 * Parallax simples (Vite/React) sem libs.
 * Move o elemento conforme ele cruza a viewport.
 */
export const Parallax: React.FC<Props> = ({
  children,
  className,
  style,
  config = HERO_PARALLAX,
  disabled,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (disabled) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (reduce) return;

    const el = ref.current;
    if (!el) return;

    const onFrame = () => {
      rafRef.current = null;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      // 0 quando ainda está abaixo, 1 quando já passou acima
      const t = clamp((vh - rect.top) / (vh + rect.height));

      const yCfg = config.y ?? HERO_PARALLAX.y;
      const sCfg = config.scale ?? HERO_PARALLAX.scale;
      const rCfg = config.rotate ?? HERO_PARALLAX.rotate;

      const y = lerp(yCfg[0], yCfg[1], t);
      const s = lerp(sCfg[0], sCfg[1], t);
      const r = lerp(rCfg[0], rCfg[1], t);

      el.style.transform = `translate3d(0, ${y}px, 0) scale(${s}) rotate(${r}deg)`;
    };

    const request = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(onFrame);
    };

    request();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);

    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [ready, disabled, config]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        willChange: disabled ? undefined : "transform",
        transform: "translate3d(0,0,0)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
