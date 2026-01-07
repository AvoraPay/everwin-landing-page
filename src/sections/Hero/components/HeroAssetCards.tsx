// everwin-page/src/sections/Hero/components/HeroAssetCards.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AssetCard } from "../../../components/AssetCard";
import { HeroImage } from "./HeroImage";

type Quote = {
  ok: boolean;
  tvSymbol: string;
  price?: number;
  change24hPct?: number;
  change5mPct?: number;
  updatedAt: number;
  error?: string;
};

type QuotesResponse = {
  ok: boolean;
  data?: Record<string, Quote>;
  error?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function useSmoothParallax(ref: React.RefObject<HTMLElement>) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    let current = 0;
    let target = 0;

    const updateTarget = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;

      const total = rect.height + vh;
      const passed = vh - rect.top;
      const progress = clamp(passed / total, 0, 1);

      target = (progress - 0.5) * 2; // -1..1
    };

    const tick = () => {
      current = current + (target - current) * 0.08;
      setValue(current);
      raf = requestAnimationFrame(tick);
    };

    updateTarget();
    raf = requestAnimationFrame(tick);

    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);

    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
      cancelAnimationFrame(raf);
    };
  }, [ref]);

  return value;
}

function fmtPrice(n?: number, decimals = 4) {
  if (typeof n !== "number") return "—";
  return n.toFixed(decimals);
}

// seta + percentual (pra “setinha ao lado da cotação” funcionar)
function fmtPctWithArrow(n?: number) {
  if (typeof n !== "number") return "—";
  const arrow = n < 0 ? "▼" : "▲";
  const sign = n > 0 ? "+" : ""; // negativo já vem com "-"
  return `${arrow} ${sign}${n.toFixed(2)}%`;
}

function trendClass(n?: number) {
  if (typeof n !== "number") return "text-gray-500";
  if (n > 0) return "text-emerald-500";
  if (n < 0) return "text-red-700";
  return "text-gray-500";
}

export const HeroAssetCards = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const t = useSmoothParallax(sectionRef);

  const symbols = useMemo(() => ["NASDAQ:GOOGL", "NASDAQ:META"], []);

  const [quotes, setQuotes] = useState<Record<string, Quote>>({});

  useEffect(() => {
    let alive = true;
    let timer: any;

    const run = async () => {
      try {
        const apiSymbols = symbols.join(",");
        const base =
          (import.meta as any)?.env?.VITE_QUOTES_BASE_URL ?? "https://everwin-quotes-worker.brasilcodecenter.workers.dev";

        const res = await fetch(
          `${base}/market/quotes?symbols=${encodeURIComponent(apiSymbols)}`,
          { cache: "no-store" }
        );

        const json = (await res.json()) as QuotesResponse;
        if (!alive) return;

        setQuotes(json?.data ?? {});
      } catch {
        // mantém último estado
      }
    };

    run();
    timer = setInterval(run, 15000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [symbols]);

  const offsets = useMemo(() => {
    return {
      google: t * 52, // <- Google agora no “slot da direita”
      meta: t * -24,
    };
  }, [t]);

  const google = quotes["NASDAQ:GOOGL"];
  const meta = quotes["NASDAQ:META"];

  const cardData = useMemo(() => {
    return {
      google: {
        profit: google?.change24hPct, // número puro (pra cor)
        profitText:
          typeof google?.change24hPct === "number"
            ? `${google.change24hPct > 0 ? "+" : ""}${google.change24hPct.toFixed(2)}%`
            : "—",
        price: fmtPrice(google?.price, 4),
        variationText: fmtPctWithArrow(google?.change5mPct),
        variationClass: trendClass(google?.change5mPct),
      },
      meta: {
        profit: meta?.change24hPct,
        profitText:
          typeof meta?.change24hPct === "number"
            ? `${meta.change24hPct > 0 ? "+" : ""}${meta.change24hPct.toFixed(2)}%`
            : "—",
        price: fmtPrice(meta?.price, 4),
        variationText: fmtPctWithArrow(meta?.change5mPct),
        variationClass: trendClass(meta?.change5mPct),
      },
    };
  }, [google, meta]);

  return (
    <div ref={sectionRef} className="relative mx-auto w-full max-w-[1120px]">
      <div className="relative rounded-t-[52px] bg-gray-800/10 px-3 pt-4 sm:px-4 sm:pt-5 md:px-8 md:pt-[21px]">
        <HeroImage />

        {/* Meta (top-left) */}
        <div className="pointer-events-none absolute left-6 top-4 sm:left-8 sm:top-5 md:left-10 md:top-7">
          <div
            className="will-change-transform"
            style={{ transform: `translate3d(0, ${offsets.meta}px, 0)` }}
          >
            <AssetCard
              iconUrl="https://c.animaapp.com/mk284v6uqUa07j/assets/icon-5.svg"
              profitIconUrl="https://c.animaapp.com/mk284v6uqUa07j/assets/icon-3.svg"
              profitPercentage={cardData.meta.profitText}
              price={cardData.meta.price}
              variation={cardData.meta.variationText}
              variationClassName={`text-base leading-4 text-center text-nowrap font-sora ${cardData.meta.variationClass}`}
              iconContainerClassName="relative shrink-0 h-[42px] w-[100px]"
              wrapperClassName="scale-[0.55] sm:scale-[0.65] md:scale-[0.70] origin-top-left"
            />
          </div>
        </div>

        {/* Google (RIGHT - no lugar do antigo BTC) */}
        <div className="pointer-events-none absolute right-1 top-[60%] -translate-y-1/2 sm:right-0 sm:top-[62%] md:-right-[34px] md:top-[60%]">
          <div
            className="will-change-transform"
            style={{ transform: `translate3d(0, ${offsets.google}px, 0)` }}
          >
            <AssetCard
              iconUrl="https://c.animaapp.com/mk284v6uqUa07j/assets/icon-2.svg"
              profitIconUrl="https://c.animaapp.com/mk284v6uqUa07j/assets/icon-3.svg"
              profitPercentage={cardData.google.profitText}
              price={cardData.google.price}
              variation={cardData.google.variationText}
              variationClassName={`text-base leading-4 text-center text-nowrap font-sora ${cardData.google.variationClass}`}
              iconContainerClassName="relative shrink-0 h-[42px] w-[117px]"
              wrapperClassName="scale-[0.70] sm:scale-[0.85] md:scale-[0.90] origin-right"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
