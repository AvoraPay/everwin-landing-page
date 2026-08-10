import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Save, Scale } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { fetchPlansApi, updatePlanRulesApi } from "../../api";
import { formatPropMoney } from "../../rules";
import { PortalField, PortalLoadingState, PortalSection, PortalSurface } from "../../portal-ui";
import type { PlanTemplate } from "../../types";

const inputClass =
  "h-10 rounded-xl border-slate-200 bg-slate-50 text-slate-900 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white";

type Draft = {
  profitTargetPhase1Pct: string;
  profitTargetPhase2Pct: string;
  maxDrawdownPct: string;
  dailyLossLimitPct: string;
  minTradingDays: string;
  durationDays: string;
  consistencyRulePct: string;
};

function toDraft(plan: PlanTemplate): Draft {
  return {
    profitTargetPhase1Pct: String(plan.profitTargetPhase1Pct),
    profitTargetPhase2Pct: String(plan.profitTargetPhase2Pct),
    maxDrawdownPct: String(plan.maxDrawdownPct),
    dailyLossLimitPct: String(plan.dailyLossLimitPct),
    minTradingDays: String(plan.minTradingDays),
    durationDays: String(plan.durationDays),
    consistencyRulePct: String(plan.consistencyRulePct ?? 0),
  };
}

/**
 * The evaluation rules, per plan.
 *
 * Only the rules are editable here: account size, fee and currency are what the
 * trader bought, and rewriting those under a live account would change the deal
 * after the fact. Saving re-grades every account on the plan immediately, so a
 * change is never something a trader discovers days later.
 */
export function PlanRulesPanel({ language }: { language: string }) {
  const [plans, setPlans] = useState<PlanTemplate[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await fetchPlansApi();
      setPlans(list);
      setDrafts(Object.fromEntries(list.map((plan) => [plan.id, toDraft(plan)])));
      setOpenId((current) => current ?? list[0]?.id ?? null);
    } catch (error) {
      setFeedback({ tone: "error", text: error instanceof Error ? error.message : "Falha ao carregar os planos." });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const plan = useMemo(() => plans?.find((item) => item.id === openId) ?? null, [plans, openId]);
  const draft = plan ? drafts[plan.id] : undefined;

  const set = (field: keyof Draft, value: string) => {
    if (!plan) return;
    setDrafts((current) => ({ ...current, [plan.id]: { ...current[plan.id], [field]: value } }));
  };

  const save = async () => {
    if (!plan || !draft) return;
    const numbers = {
      profitTargetPhase1Pct: Number(draft.profitTargetPhase1Pct.replace(",", ".")),
      profitTargetPhase2Pct: Number(draft.profitTargetPhase2Pct.replace(",", ".")),
      maxDrawdownPct: Number(draft.maxDrawdownPct.replace(",", ".")),
      dailyLossLimitPct: Number(draft.dailyLossLimitPct.replace(",", ".")),
      minTradingDays: Number(draft.minTradingDays),
      durationDays: Number(draft.durationDays),
      consistencyRulePct: Number(draft.consistencyRulePct.replace(",", ".")),
    };

    if (Object.values(numbers).some((value) => !Number.isFinite(value))) {
      setFeedback({ tone: "error", text: "Há um campo com valor inválido." });
      return;
    }

    setSavingId(plan.id);
    setFeedback(null);
    try {
      const result = await updatePlanRulesApi(plan.id, numbers);
      setFeedback({
        tone: "ok",
        text: `Regras salvas. ${result.reevaluatedAccounts} conta(s) reavaliada(s).`,
      });
      await load();
    } catch (error) {
      setFeedback({ tone: "error", text: error instanceof Error ? error.message : "Falha ao salvar." });
    } finally {
      setSavingId(null);
    }
  };

  if (!plans) return <PortalLoadingState title="Carregando planos..." lines={4} />;

  const rulePct = Number(draft?.consistencyRulePct.replace(",", ".") ?? 0);
  const currency = plan?.currency ?? "BRL";

  return (
    <PortalSection
      title={
        <span className="flex items-center gap-2">
          <Scale className="h-4 w-4" /> Regras de Avaliação
        </span>
      }
      description="Metas, limites de risco e a regra de consistência de cada plano. Salvar reavalia todas as contas do plano na hora."
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {plans.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenId(item.id)}
              className={
                item.id === openId
                  ? "rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                  : "rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 dark:border-white/[0.07] dark:text-white/60"
              }
            >
              {item.name}
            </button>
          ))}
        </div>

        {plan && draft ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <PortalField label="Meta Fase 1 (%)">
                <Input value={draft.profitTargetPhase1Pct} onChange={(e) => set("profitTargetPhase1Pct", e.target.value)} inputMode="decimal" className={inputClass} />
              </PortalField>
              <PortalField label="Meta Fase 2 (%)" hint="Acumulada sobre o saldo inicial.">
                <Input value={draft.profitTargetPhase2Pct} onChange={(e) => set("profitTargetPhase2Pct", e.target.value)} inputMode="decimal" className={inputClass} />
              </PortalField>
              <PortalField label="Drawdown máximo (%)">
                <Input value={draft.maxDrawdownPct} onChange={(e) => set("maxDrawdownPct", e.target.value)} inputMode="decimal" className={inputClass} />
              </PortalField>
              <PortalField label="Perda diária (%)" hint="Pausa a conta, não reprova.">
                <Input value={draft.dailyLossLimitPct} onChange={(e) => set("dailyLossLimitPct", e.target.value)} inputMode="decimal" className={inputClass} />
              </PortalField>
              <PortalField label="Dias mínimos">
                <Input value={draft.minTradingDays} onChange={(e) => set("minTradingDays", e.target.value)} inputMode="numeric" className={inputClass} />
              </PortalField>
              <PortalField label="Prazo (dias)">
                <Input value={draft.durationDays} onChange={(e) => set("durationDays", e.target.value)} inputMode="numeric" className={inputClass} />
              </PortalField>
            </div>

            <PortalSurface tone="subtle" padding="sm">
              <PortalField
                label="Regra de consistência (%)"
                hint="Participação máxima de um único dia no lucro total. 0 desliga a regra."
              >
                <Input value={draft.consistencyRulePct} onChange={(e) => set("consistencyRulePct", e.target.value)} inputMode="decimal" className={inputClass} />
              </PortalField>

              <p className="mt-3 text-xs leading-6 text-slate-600 dark:text-white/50">
                {rulePct > 0 ? (
                  <>
                    Com {rulePct}%, um dia de {formatPropMoney(plan.accountSize * 0.03, currency, language)} exige
                    lucro total de {formatPropMoney((plan.accountSize * 0.03) / (rulePct / 100), currency, language)}{" "}
                    para a fase ser concluída — a meta sobe sozinha até o melhor dia caber na regra. Ela nunca reprova
                    a conta: apenas segura a aprovação. Na prática, exige pelo menos {Math.ceil(100 / rulePct)} dias
                    de resultado equivalente.
                  </>
                ) : (
                  <>Regra desligada: um único dia pode responder por todo o lucro da fase.</>
                )}
              </p>
            </PortalSurface>

            {feedback ? (
              <p className={feedback.tone === "ok" ? "text-sm text-emerald-600 dark:text-emerald-400" : "text-sm text-red-600 dark:text-red-400"}>
                {feedback.text}
              </p>
            ) : null}

            <Button
              type="button"
              onClick={() => void save()}
              disabled={savingId === plan.id}
              className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {savingId === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar regras de {plan.name}
            </Button>
          </>
        ) : null}
      </div>
    </PortalSection>
  );
}
