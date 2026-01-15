import { useEffect, useMemo, useState } from "react";
import { ToolCard } from "./components/ToolCard";

type Quote = {
  ok: boolean;
  tvSymbol: string;
  price?: number;
  updatedAt: number;
};

type QuotesResponse = {
  ok: boolean;
  data?: Record<string, Quote>;
  error?: string;
};

function fmtPrice(n?: number) {
  if (typeof n !== "number") return "—";
  return n >= 1000 ? n.toFixed(2) : n.toFixed(4);
}

export const ToolsSection = () => {
  const base =
    (import.meta as any)?.env?.VITE_QUOTES_BASE_URL ?? "https://everwin-quotes-worker.brasilcodecenter.workers.dev";

  // ✅ vamos usar META no card alert
  const symbols = useMemo(() => ["NASDAQ:META"], []);

  const [metaPrice, setMetaPrice] = useState<string>("—");

  useEffect(() => {
    let alive = true;
    let timer: any;

    const run = async () => {
      try {
        const apiSymbols = symbols.join(",");
        const res = await fetch(
          `${base}/market/quotes?symbols=${encodeURIComponent(apiSymbols)}`,
          { cache: "no-store" }
        );
        const json = (await res.json()) as QuotesResponse;
        if (!alive) return;

        const meta = json?.data?.["NASDAQ:META"];
        setMetaPrice(fmtPrice(meta?.price));
      } catch {
        // mantém o último estado
      }
    };

    run();
    timer = setInterval(run, 15000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [base, symbols]);

  return (
   <section id="tools" className="relative w-full py-0 md:py-8">
      <div className="mx-auto w-[90%] max-w-[1060px]">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* HEADER (span 2 no desktop) */}
          <div className="md:col-span-2">
            <ToolCard
              type="header"
              title="Tools traders love"
              description="Everwin brings advanced insights and automation to help you decide faster."
            />
          </div>

          {/* ALERT (BTC -> META) */}
          <ToolCard
            type="alert"
            title="Smart alerts, right on time"
            description="Set your target and get notified when the market hits your level."
            badgeLabel="Updates"
            metricLabel="META"
            metricValue={metaPrice}
            // ✅ ícone do Meta (você pode trocar por um local depois)
            metricIconUrl="https://c.animaapp.com/mk284v6uqUa07j/assets/icon-5.svg"
          />

          {/* AUTOMATION */}
          <ToolCard
            type="automation"
            title={
              <>
                Automate your <span className="text-emerald-500">exits</span>
              </>
            }
            description="Close at the right time with rules that reduce risk and improve consistency."
            resultLabel="Result"
            resultValue="+870.03"
          />

          {/* FEED */}
          <ToolCard
            type="feed"
            title={
              <>
                A smarter <span className="text-emerald-500">market feed</span>
              </>
            }
            description="Stay informed with what matters — no noise, just signals."
            listTitle="Popular"
            list={[
              { name: "AUD/CAD", sub: "0.89226" },
              { name: "Walgreens Boots", sub: "0.89226" },
              { name: "United Kingdom", sub: "0.89226" },
            ]}
            footerNote="Market Commentary • Weekly"
          />

          {/* CALENDAR */}
          <ToolCard
            type="calendar"
            title={
              <>
                Integrated{" "}
                <span className="text-emerald-500">Economic Calendar</span>
              </>
            }
            description="Know what’s coming and plan with confidence — all inside Everwin."
            calendarTitle="Economic calendar"
            events={[
              { title: "Annual visitors", time: "18:46", active: true },
              { title: "Foreign securities", time: "18:42" },
              { title: "Stocks by foreigners", time: "18:30" },
              { title: "House price index", time: "18:28" },
            ]}
          />

          {/* CTA ROW */}
          <div className="md:col-span-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-gray-500 font-bricolage_grotesque text-base leading-[26px]">
                Start with Everwin in minutes — tools built for clarity, speed and
                control.
              </p>

              <a
                href="/register"
                className="relative flex h-[76px] w-full items-center justify-center overflow-hidden rounded-2xl bg-emerald-500/10 p-2 md:w-[420px]"
              >
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-emerald-500 p-4">
                  <p className="font-bricolage_grotesque text-gray-800 text-base font-medium">
                    Create account
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
