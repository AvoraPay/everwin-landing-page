import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Ban,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  RadioTower,
  RefreshCw,
  Send,
  TriangleAlert,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { fetchPaymentWebhookFeedApi, sendTestWebhookApi } from "../../api";
import { formatPropDateTime } from "../../rules";
import {
  PortalEmptyState,
  PortalFeedback,
  PortalFilterBar,
  PortalFilterChip,
  PortalLoadingState,
  PortalPageHeader,
  PortalSearchInput,
  PortalSection,
  PortalStatCard,
  PortalStatusPill,
  PortalSurface,
} from "../../portal-ui";
import type { PaymentWebhookEvent, PaymentWebhookFeed } from "../../types";

const REFRESH_MS = 10_000;

type StatusFilter = "all" | "processed" | "unmatched" | "ignored" | "failed";

const STATUS_META: Record<
  PaymentWebhookEvent["status"],
  { label: string; tone: "success" | "warning" | "neutral" | "danger" }
> = {
  processed: { label: "Processado", tone: "success" },
  unmatched: { label: "Não identificado", tone: "warning" },
  ignored: { label: "Ignorado", tone: "neutral" },
  failed: { label: "Falhou", tone: "danger" },
};

function prettyPayload(raw: string) {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function AdminWebhookMonitorPage() {
  const [feed, setFeed] = useState<PaymentWebhookFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const [testing, setTesting] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (initial: boolean) => {
    if (initial) setLoading(true);
    try {
      setFeed(await fetchPaymentWebhookFeedApi());
      setError(null);
      setLastCheck(new Date());
    } catch (nextError) {
      if (initial) setError(nextError instanceof Error ? nextError.message : "Falha ao carregar eventos.");
    } finally {
      if (initial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
  }, [load]);

  useEffect(() => {
    if (!live) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => void load(false), REFRESH_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [live, load]);

  const handleTest = async () => {
    setTesting(true);
    setFeedback(null);
    try {
      const result = await sendTestWebhookApi({ dryRun: true });
      setFeedback({
        ok: result.ok,
        message: result.ok
          ? "Evento de teste entregue. Ele aparece na lista como ignorado ou não identificado — é o esperado num teste."
          : `O receiver respondeu ${result.status}.`,
      });
      await load(false);
    } catch (nextError) {
      setFeedback({ ok: false, message: nextError instanceof Error ? nextError.message : "Falha ao enviar teste." });
    } finally {
      setTesting(false);
    }
  };

  const events = feed?.events ?? [];

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return events.filter((event) => {
      if (filter !== "all" && event.status !== filter) return false;
      if (!text) return true;
      return [event.externalId, event.customerEmail, event.submissionCode, event.eventType, event.note]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(text);
    });
  }, [events, filter, query]);

  const summary = feed?.summary ?? { processed: 0, unmatched: 0, ignored: 0, failed: 0 };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Monitor de pagamentos"
        title="Recebimentos"
        description="Tudo que a Novus envia chega aqui — aprovado, ignorado ou sem dono."
        actions={
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={testing}
              className="h-9 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-[#171a23] dark:text-white/70"
              onClick={() => void handleTest()}
            >
              <Send className="h-4 w-4" />
              Enviar teste
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={() => void load(true)}
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        }
        meta={
          <>
            <button type="button" onClick={() => setLive((value) => !value)}>
              <PortalStatusPill tone={live ? "success" : "neutral"}>
                <span className="inline-flex items-center gap-1.5">
                  <RadioTower className="h-3 w-3" />
                  {live ? "Ao vivo" : "Pausado"}
                </span>
              </PortalStatusPill>
            </button>
            {lastCheck ? (
              <span className="text-xs text-slate-500 dark:text-white/40">
                última checagem {lastCheck.toLocaleTimeString("pt-BR")}
              </span>
            ) : null}
          </>
        }
      />

      {feedback ? <PortalFeedback ok={feedback.ok} message={feedback.message} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard label="Processados" value={summary.processed} tone="success" icon={<CheckCircle2 className="h-4 w-4" />} />
        <PortalStatCard
          label="Sem dono"
          value={summary.unmatched}
          tone={summary.unmatched > 0 ? "warning" : "neutral"}
          icon={<CircleAlert className="h-4 w-4" />}
        />
        <PortalStatCard label="Ignorados" value={summary.ignored} tone="neutral" icon={<Ban className="h-4 w-4" />} />
        <PortalStatCard
          label="Falhas"
          value={summary.failed}
          tone={summary.failed > 0 ? "danger" : "neutral"}
          icon={<TriangleAlert className="h-4 w-4" />}
        />
      </div>

      {summary.unmatched > 0 ? (
        <PortalSurface tone="subtle" className="border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
            {summary.unmatched} pagamento(s) chegaram sem inscrição correspondente.
          </p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400/80">
            Abra o evento, confira o e-mail do comprador e aprove a inscrição dele na tela de Inscrições.
          </p>
        </PortalSurface>
      ) : null}

      <PortalSection title="Eventos recebidos" description="Os 100 mais recentes, do mais novo para o mais antigo">
        <div className="space-y-4">
          <PortalFilterBar>
            <PortalSearchInput value={query} onChange={setQuery} placeholder="Buscar transação, e-mail ou código" />
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: "all", label: "Todos" },
                  { key: "processed", label: "Processados" },
                  { key: "unmatched", label: "Sem dono" },
                  { key: "ignored", label: "Ignorados" },
                  { key: "failed", label: "Falhas" },
                ] as Array<{ key: StatusFilter; label: string }>
              ).map((entry) => (
                <PortalFilterChip key={entry.key} active={filter === entry.key} onClick={() => setFilter(entry.key)}>
                  {entry.label}
                </PortalFilterChip>
              ))}
            </div>
          </PortalFilterBar>

          {error ? <PortalFeedback ok={false} message={error} /> : null}

          {loading ? (
            <PortalLoadingState title="Carregando eventos..." lines={5} />
          ) : filtered.length === 0 ? (
            <PortalEmptyState
              title="Nada recebido ainda"
              description="Cadastre a URL do webhook na Novus e faça um pagamento de teste. Os eventos aparecem aqui em segundos."
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((event) => {
                const meta = STATUS_META[event.status];
                const open = openId === event.id;

                return (
                  <div
                    key={event.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/[0.07] dark:bg-white/[0.03]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : event.id)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                    >
                      <ChevronRight
                        className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-90" : ""}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <PortalStatusPill tone={meta.tone}>{meta.label}</PortalStatusPill>
                          <span className="font-mono text-xs text-slate-500 dark:text-white/40">{event.eventType}</span>
                          {event.amount ? (
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {event.currency} {event.amount.toLocaleString("pt-BR")}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500 dark:text-white/40">
                          {[event.customerEmail, event.submissionCode, event.externalId].filter(Boolean).join(" · ")}
                        </p>
                        {event.note ? (
                          <p className="mt-1 truncate text-xs text-slate-400 dark:text-white/30">{event.note}</p>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-xs text-slate-400 dark:text-white/30">
                        {formatPropDateTime(event.createdAt, "pt-BR")}
                      </span>
                    </button>

                    {open ? (
                      <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-white/[0.07] dark:bg-black/20">
                        {event.submissionCode ? (
                          <a
                            href={`/prop/submission?id=${event.submissionCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Ver inscrição {event.submissionCode}
                          </a>
                        ) : null}
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/40">
                          Payload recebido
                        </p>
                        <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-white p-3 font-mono text-[11px] leading-5 text-slate-600 dark:bg-black/30 dark:text-white/60">
                          {prettyPayload(event.payload)}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PortalSection>
    </div>
  );
}
