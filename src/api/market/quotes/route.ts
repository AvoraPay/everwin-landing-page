// everwin-page/src/app/api/market/quotes/route.ts

// Evita erro "Cannot find name 'process'" em projetos sem @types/node
declare const process: any;

type Quote = {
  ok: boolean;
  tvSymbol: string;
  price?: number;
  change24hPct?: number; // %
  change5mPct?: number; // %
  updatedAt: number;
  error?: string;
};

type Out = { ok: boolean; data: Record<string, Quote>; error?: string };

function toNum(v: any): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${txt}`.slice(0, 240));
  }
  return res.json();
}

/**
 * Normaliza símbolos tipo TradingView -> Finnhub
 * - NASDAQ:GOOGL -> GOOGL
 * - AAPL -> AAPL
 * - BINANCE:BTCUSDT -> BINANCE:BTC_USDT
 * - BINANCE:BTC_USDT -> BINANCE:BTC_USDT
 * - OANDA:EURUSD -> OANDA:EUR_USD
 * - OANDA:EUR_USD -> OANDA:EUR_USD
 */
function normalizeFinnhubSymbol(tvSymbol: string) {
  const s = String(tvSymbol || "").trim();
  const up = s.toUpperCase();

  // Crypto BINANCE
  if (up.startsWith("BINANCE:")) {
    const raw = (s.split(":")[1] || "").trim();
    const sym = raw.replace(/[-/]/g, "").toUpperCase(); // sem replaceAll

    // BTCUSDT -> BTC_USDT
    if (sym.endsWith("USDT") && sym.indexOf("_") === -1) {
      const base = sym.slice(0, sym.length - 4);
      return `BINANCE:${base}_USDT`;
    }

    // BTCUSD -> BTC_USD (às vezes)
    if (sym.endsWith("USD") && sym.indexOf("_") === -1) {
      const base = sym.slice(0, sym.length - 3);
      return `BINANCE:${base}_USD`;
    }

    return `BINANCE:${raw.toUpperCase()}`;
  }

  // Forex OANDA
  if (up.startsWith("OANDA:")) {
    const raw = (s.split(":")[1] || "").trim();
    const sym = raw.replace(/[-/]/g, "").toUpperCase();

    // EURUSD -> EUR_USD
    if (sym.length === 6 && sym.indexOf("_") === -1) {
      return `OANDA:${sym.slice(0, 3)}_${sym.slice(3, 6)}`;
    }

    return `OANDA:${raw.toUpperCase()}`;
  }

  // Stocks com exchange prefix: NASDAQ:GOOGL -> GOOGL
  if (s.indexOf(":") !== -1) {
    return (s.split(":")[1] || s).trim().toUpperCase();
  }

  return s.toUpperCase();
}

function candleKindForSymbol(tvSymbol: string): "stock" | "crypto" | "forex" {
  const up = String(tvSymbol || "").toUpperCase();
  if (up.startsWith("BINANCE:")) return "crypto";
  if (up.startsWith("OANDA:")) return "forex";
  return "stock";
}

async function get5mChangePct(
  kind: "stock" | "crypto" | "forex",
  symbol: string,
  token: string
) {
  const to = Math.floor(Date.now() / 1000);
  const from = to - 60 * 60; // janela 60min (pega pelo menos 2 candles de 5m)

  const base =
    kind === "stock"
      ? "stock/candle"
      : kind === "crypto"
      ? "crypto/candle"
      : "forex/candle";

  const url =
    `https://finnhub.io/api/v1/${base}` +
    `?symbol=${encodeURIComponent(symbol)}` +
    `&resolution=5&from=${from}&to=${to}` +
    `&token=${encodeURIComponent(token)}`;

  const candle = await fetchJson(url);

  const closes: number[] = Array.isArray(candle?.c) ? candle.c : [];
  if (closes.length < 2) return undefined;

  // sem .at()
  const last = closes[closes.length - 1];
  const prev = closes[closes.length - 2];

  if (typeof last !== "number" || typeof prev !== "number" || prev === 0) return undefined;

  return ((last - prev) / prev) * 100;
}

async function getQuote(tvSymbol: string, token: string): Promise<Quote> {
  const normalized = normalizeFinnhubSymbol(tvSymbol);
  const kind = candleKindForSymbol(tvSymbol);

  // /quote aceita: AAPL, GOOGL, OANDA:EUR_USD, BINANCE:BTC_USDT
  const quoteUrl =
    `https://finnhub.io/api/v1/quote` +
    `?symbol=${encodeURIComponent(normalized)}` +
    `&token=${encodeURIComponent(token)}`;

  const q = await fetchJson(quoteUrl);

  const price = toNum(q?.c);
  const change24hPct = toNum(q?.dp);

  let change5mPct: number | undefined;
  try {
    change5mPct = await get5mChangePct(kind, normalized, token);
  } catch {
    change5mPct = undefined;
  }

  return {
    ok: true,
    tvSymbol,
    price,
    change24hPct,
    change5mPct,
    updatedAt: Date.now(),
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbolsParam = url.searchParams.get("symbols") || "";
  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!symbols.length) {
    const out: Out = { ok: false, data: {}, error: "Missing symbols" };
    return new Response(JSON.stringify(out), {
      status: 400,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  const tokenRaw = process?.env?.FINNHUB_TOKEN;
  const token = typeof tokenRaw === "string" ? tokenRaw.trim() : "";

  if (!token) {
    const out: Out = {
      ok: false,
      data: {},
      error: "Missing FINNHUB_TOKEN. Put it in .env.local and restart dev server.",
    };
    return new Response(JSON.stringify(out), {
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  const data: Record<string, Quote> = {};

  await Promise.all(
    symbols.map(async (tvSymbol) => {
      try {
        data[tvSymbol] = await getQuote(tvSymbol, token);
      } catch (e: any) {
        data[tvSymbol] = {
          ok: false,
          tvSymbol,
          updatedAt: Date.now(),
          error: e?.message || "Failed to fetch quote",
        };
      }
    })
  );

  const out: Out = { ok: true, data };

  return new Response(JSON.stringify(out), {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
