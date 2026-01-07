import { useEffect, useRef } from "react";

const SYMBOLS =
  "FX:EURUSD,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,CMCMARKETS:GOLD,TICKMILL:EURJPY,TICKMILL:EURGBP,FX:USDJPY,OANDA:USDCAD,OANDA:AUDCAD,FPMARKETS:GBPUSD";

export function TradingViewTickerTape() {
  const mountRef = useRef<HTMLDivElement | null>(null);
    
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // limpa caso o React recarregue (HMR)
    el.replaceChildren();

    // 1) script do widget
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js";
    script.async = true;

    // 2) custom element do ticker
    const widget = document.createElement("tv-ticker-tape");
    widget.setAttribute("symbols", SYMBOLS);

    // opcional: tente esses attrs se quiser controlar melhor (se suportar no seu build do widget)
    // widget.setAttribute("colorTheme", "light");
    // widget.setAttribute("locale", "en");
    // widget.setAttribute("displayMode", "regular");

    el.appendChild(script);
    el.appendChild(widget);

    return () => {
      el.replaceChildren();
    };
    
  }, []);
  
  return (
    <div
      className="w-full"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 14%, rgba(0,0,0,1) 86%, rgba(0,0,0,0) 100%)",
        maskImage:
          "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 14%, rgba(0,0,0,1) 86%, rgba(0,0,0,0) 100%)",
      }}
    >
      <div className="mx-auto w-[92%] overflow-hidden py-4">
        <div ref={mountRef} />
      </div>
    </div>
  );
}
