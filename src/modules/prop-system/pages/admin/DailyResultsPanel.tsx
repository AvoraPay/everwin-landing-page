import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { cn } from "../../../../lib/utils";
import { deleteDailyResultApi, fetchAccountDailyApi, recordDailyResultApi } from "../../api";
import { formatPropMoney } from "../../rules";
import { PortalField, PortalLoadingState, PortalSection, PortalStatusPill, PortalSurface } from "../../portal-ui";
import type { AccountDailyFeed, PlanTemplate, PropAccount } from "../../types";

const inputClass =
  "h-10 rounded-xl border-slate-200 bg-slate-50 text-slate-900 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white";

function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The admin's daily feed for an account.
 *
 * Results are recorded per day, and the account's balance, days traded and
 * drawdown are derived from that series on the server. Entering a result here
 * is the only way a number reaches the trader's calendar.
 */
export function DailyResultsPanel({
  account,
  plan,
  language,
  onChanged,
}: {
  account: PropAccount;
  plan: PlanTemplate;
  language: string;
  onChanged?: () => void;
}) {
  const [feed, setFeed] = useState<AccountDailyFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState(today());
  const [pnl, setPnl] = useState("");

  const currency = plan.currency ?? "BRL";
  const money = useCallback(
    (value: number) => formatPropMoney(value, currency, language),
    [currency, language],
  );

  const dailyLimit = (plan.dailyLossLimitPct / 100) * account.initialBalance;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFeed(await fetchAccountDailyApi(account.id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar os dias.");
    } finally {
      setLoading(false);
    }
  }, [account.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(() => {
    const days = feed?.days ?? [];
    return {
      count: days.length,
      sum: days.reduce((acc, d) => acc + d.pnl, 0),
      wins: days.filter((d) => d.pnl > 0).length,
      breaches: days.filter((d) => d.breachedDailyLimit).length,
    };
  }, [feed]);

  const submit = async () => {
    const parsed = Number(String(pnl).replace(",", "."));
    if (!Number.isFinite(parsed)) {
      setError("Informe o resultado do dia — use ponto ou vírgula para os centavos.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await recordDailyResultApi(account.id, { date, pnl: parsed });
      setPnl("");
      await load();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gravar o dia.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (day: string) => {
    setBusy(true);
    setError(null);
    try {
      await deleteDailyResultApi(account.id, day);
      await load();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao remover o dia.");
    } finally {
      setBusy(false);
    }
  };

  const willBreach = (() => {
    const parsed = Number(String(pnl).replace(",", "."));
    return Number.isFinite(parsed) && parsed <= -dailyLimit;
  })();

  const existing = feed?.days.find((d) => d.date === date);

  return (
    <PortalSection
      title="Resultados diários"
      description="O saldo e os dias operados da conta são calculados a partir daqui"
    >
      <div className="space-y-5">
        <PortalSurface tone="subtle" padding="sm">
          <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:items-end">
            <PortalField label="Data">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </PortalField>

            <PortalField
              label={`Resultado do dia (${currency})`}
              hint={`Negativo para perda. Limite diário: ${money(dailyLimit)}`}
            >
              <Input
                value={pnl}
                onChange={(e) => setPnl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submit();
                }}
                placeholder="ex.: 1250 ou -830"
                inputMode="decimal"
                className={inputClass}
              />
            </PortalField>

            <Button
              type="button"
              onClick={() => void submit()}
              disabled={busy || !pnl.trim()}
              className="h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {existing ? "Atualizar" : "Lançar"}
            </Button>
          </div>

          {existing ? (
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
              Já existe um lançamento em {existing.date} de {money(existing.pnl)}. Gravar de novo substitui o valor.
            </p>
          ) : null}

          {willBreach ? (
            <p className="mt-3 flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Esse valor estoura o limite diário e vai pausar a conta automaticamente.
            </p>
          ) : null}

          {error ? <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p> : null}
        </PortalSurface>

        {loading ? (
          <PortalLoadingState title="Carregando lançamentos..." lines={4} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Dias lançados" value={String(totals.count)} />
              <Metric
                label="Resultado acumulado"
                value={`${totals.sum >= 0 ? "+" : ""}${money(totals.sum)}`}
                tone={totals.sum > 0 ? "up" : totals.sum < 0 ? "down" : undefined}
              />
              <Metric label="Dias positivos" value={String(totals.wins)} />
              <Metric
                label="Estouros de limite"
                value={String(totals.breaches)}
                tone={totals.breaches > 0 ? "down" : undefined}
              />
            </div>

            {feed && feed.days.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/[0.07]">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.03]">
                      {["Data", "Resultado", "Saldo após", "Limite", ""].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-white/35"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {feed.days.map((day) => (
                      <tr key={day.date} className="border-b border-slate-100 last:border-0 dark:border-white/[0.05]">
                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-white/70">
                          {day.date.split("-").reverse().join("/")}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-3 text-sm font-semibold tabular-nums",
                            day.pnl > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : day.pnl < 0
                                ? "text-red-600 dark:text-red-400"
                                : "text-slate-500",
                          )}
                        >
                          {day.pnl > 0 ? "+" : ""}
                          {money(day.pnl)}
                        </td>
                        <td className="px-4 py-3 text-sm tabular-nums text-slate-700 dark:text-white/70">
                          {money(day.balance)}
                        </td>
                        <td className="px-4 py-3">
                          {day.breachedDailyLimit ? (
                            <PortalStatusPill tone="danger">estourou</PortalStatusPill>
                          ) : (
                            <PortalStatusPill tone="success">ok</PortalStatusPill>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => void remove(day.date)}
                            disabled={busy}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                            aria-label={`Remover ${day.date}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center dark:border-white/[0.07]">
                <CalendarDays className="mx-auto h-7 w-7 text-slate-300 dark:text-white/15" />
                <p className="mt-3 text-sm text-slate-500 dark:text-white/40">
                  Nenhum dia lançado. O calendário do trader fica vazio até o primeiro resultado.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </PortalSection>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-xl border border-slate-200 px-4 py-3 dark:border-white/[0.07]">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-white/35">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums",
          tone === "up"
            ? "text-emerald-600 dark:text-emerald-400"
            : tone === "down"
              ? "text-red-600 dark:text-red-400"
              : "text-slate-900 dark:text-white",
        )}
      >
        {value}
      </p>
    </div>
  );
}
