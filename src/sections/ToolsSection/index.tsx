//
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ToolCard } from "./components/ToolCard";
import { useAppLinks } from "../../hooks/useAppLinks";

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
  const { t } = useTranslation();
  const links = useAppLinks();
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
              title={t("tools.header_title")}
              description={t("tools.header_desc")}
            />
          </div>

          {/* ALERT (BTC -> META) */}
          <ToolCard
            type="alert"
            title={t("tools.alert_title")}
            description={t("tools.alert_desc")}
            badgeLabel={t("tools.alert_badge")}
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
                {t("tools.auto_title_1")} <span className="text-emerald-500">{t("tools.auto_title_2")}</span>
              </>
            }
            description={t("tools.auto_desc")}
            resultLabel={t("tools.auto_result")}
            resultValue="+870.03"
          />

          {/* FEED */}
          <ToolCard
            type="feed"
            title={
              <>
                {t("tools.feed_title_1")} <span className="text-emerald-500">{t("tools.feed_title_2")}</span>
              </>
            }
            description={t("tools.feed_desc")}
            listTitle={t("tools.feed_list_title")}
            list={[
              { name: "AUD/CAD", sub: "0.89226" },
              { name: "Walgreens Boots", sub: "0.89226" },
              { name: "United Kingdom", sub: "0.89226" },
            ]}
            footerNote={t("tools.feed_footer")}
          />

          {/* CALENDAR */}
          <ToolCard
            type="calendar"
            title={
              <>
                {t("tools.cal_title_1")}{" "}
                <span className="text-emerald-500">{t("tools.cal_title_2")}</span>
              </>
            }
            description={t("tools.cal_desc")}
            calendarTitle={t("tools.cal_widget_title")}
            events={[
              { title: t("tools.cal_event_1"), time: "18:46", active: true },
              { title: t("tools.cal_event_2"), time: "18:42" },
              { title: t("tools.cal_event_3"), time: "18:30" },
              { title: t("tools.cal_event_4"), time: "18:28" },
            ]}
          />

          {/* CTA ROW */}
          <div className="md:col-span-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-gray-500 font-bricolage_grotesque text-base leading-[26px]">
                {t("tools.cta_text")}
              </p>

              <a
                href={links.register}
                className="relative flex h-[76px] w-full items-center justify-center overflow-hidden rounded-2xl bg-emerald-500/10 p-2 md:w-[420px]"
              >
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-emerald-500 p-4">
                  <p className="font-bricolage_grotesque text-gray-800 text-base font-medium">
                    {t("tools.cta_button")}
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
