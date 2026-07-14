import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, Check, Copy, Eye, EyeOff, Info, Loader2, Lock, Save, Shield, Unlock, Zap, Webhook } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { cn } from "../../../../lib/utils";
import { fetchSettingsApi, updateSettingsApi } from "../../api";
import type { SystemSetting } from "../../types";
import {
  PortalPageHeader,
  PortalSection,
  PortalField,
  PortalSurface,
  PortalStatusPill,
  PortalLoadingState,
} from "../../portal-ui";

const DEFAULT_VACANCIES_MESSAGE =
  "Vagas temporariamente fechadas. Sua inscrição segue em análise e, quando houver liberação, o link será enviado manualmente por e-mail e na página de status.";

const inputClass = "h-10 rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-900 focus-visible:ring-slate-900/10 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus-visible:border-emerald-500 dark:focus-visible:ring-emerald-500/20";

function SecretField({ label, description, value, onChange, placeholder, stored }: {
  label: string; description: string; value: string; onChange: (v: string) => void; placeholder: string; stored?: SystemSetting;
}) {
  const [show, setShow] = useState(false);
  return (
    <PortalField label={label} hint={description}>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={stored?.set ? `Atual: ${stored.preview} (deixe vazio para manter)` : placeholder}
          className={cn(inputClass, "pr-11")}
        />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:text-white/35 dark:hover:text-white/60" aria-label={show ? "Ocultar" : "Mostrar"}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {stored?.set && (
        <div className="mt-1.5 flex items-center gap-2">
          <PortalStatusPill tone="success">Configurado</PortalStatusPill>
          <span className="text-xs text-slate-500 dark:text-white/40">{stored.preview}</span>
          {stored.updatedAt && <span className="text-xs text-slate-400 dark:text-white/30">{new Date(stored.updatedAt).toLocaleDateString("pt-BR")}</span>}
        </div>
      )}
    </PortalField>
  );
}

function CopyBlock({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/40">{label}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-white/60">{value}</code>
        <button type="button" onClick={() => void handleCopy()} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-white/40 dark:hover:border-white/[0.12] dark:hover:text-white/70" aria-label="Copiar">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

function InlineFeedback({ feedback }: { feedback: { ok: boolean; message: string } }) {
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm font-medium", feedback.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400" : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400")}>
      {feedback.message}
    </div>
  );
}

function SectionNumber({ n }: { n: number }) {
  return <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">{n}</span>;
}

export function AdminSettingsPage() {
  const [stored, setStored] = useState<Record<string, SystemSetting>>({});
  const [bearer, setBearer] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [vacanciesLocked, setVacanciesLocked] = useState(true);
  const [vacanciesMessage, setVacanciesMessage] = useState(DEFAULT_VACANCIES_MESSAGE);
  const [loading, setLoading] = useState(true);
  const [savingApi, setSavingApi] = useState(false);
  const [feedbackApi, setFeedbackApi] = useState<{ ok: boolean; message: string } | null>(null);
  const [savingVagas, setSavingVagas] = useState(false);
  const [feedbackVagas, setFeedbackVagas] = useState<{ ok: boolean; message: string } | null>(null);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchSettingsApi()
      .then((s) => {
        setStored(s);
        setVacanciesLocked((s.prop_vacancies_locked?.preview ?? "true").toLowerCase() !== "false");
        setVacanciesMessage(s.prop_vacancies_message?.preview || DEFAULT_VACANCIES_MESSAGE);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const refreshStored = async () => {
    const r = await fetchSettingsApi();
    setStored(r);
    setVacanciesLocked((r.prop_vacancies_locked?.preview ?? "true").toLowerCase() !== "false");
    setVacanciesMessage(r.prop_vacancies_message?.preview || DEFAULT_VACANCIES_MESSAGE);
    return r;
  };

  const handleSaveApi = async () => {
    setSavingApi(true); setFeedbackApi(null);
    try {
      const updates: Record<string, string> = {};
      if (bearer.trim()) updates.everwin_admin_bearer = bearer.trim();
      if (webhookSecret.trim()) updates.everwin_webhook_secret = webhookSecret.trim();
      if (!Object.keys(updates).length) { setFeedbackApi({ ok: false, message: "Preencha ao menos um campo para salvar." }); return; }
      await updateSettingsApi(updates); await refreshStored();
      setBearer(""); setWebhookSecret(""); setFeedbackApi({ ok: true, message: "Credenciais salvas." });
    } catch (err) { setFeedbackApi({ ok: false, message: err instanceof Error ? err.message : "Falha ao salvar." }); }
    finally { setSavingApi(false); }
  };

  const handleSaveVagas = async () => {
    setSavingVagas(true); setFeedbackVagas(null);
    try {
      const updates: Record<string, string> = { prop_vacancies_locked: String(vacanciesLocked) };
      if (vacanciesMessage.trim()) updates.prop_vacancies_message = vacanciesMessage.trim();
      await updateSettingsApi(updates); await refreshStored();
      setFeedbackVagas({ ok: true, message: "Regras de vagas salvas." });
    } catch (err) { setFeedbackVagas({ ok: false, message: err instanceof Error ? err.message : "Falha ao salvar." }); }
    finally { setSavingVagas(false); }
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true); setWebhookResult(null);
    try {
      const res = await fetch("/prop/api/deposit", { method: "POST", headers: { "Content-Type": "application/json", "X-Webhook-Secret": "test-ping" }, body: JSON.stringify({ event: "ping", timestamp: new Date().toISOString() }) });
      setWebhookResult(res.ok ? { ok: true, message: `Endpoint acessível (${res.status})` } : { ok: false, message: `Endpoint retornou ${res.status}` });
    } catch (err) { setWebhookResult({ ok: false, message: err instanceof Error ? err.message : "Falha na conexão." }); }
    finally { setTestingWebhook(false); }
  };

  return (
    <div className="space-y-8">
      <PortalPageHeader
        eyebrow="Configurações do admin"
        title="Configurações"
        description="Gerencie credenciais, webhooks e regras de vagas da prop firm."
      />

      {loading ? <PortalLoadingState title="Carregando configurações..." lines={3} /> : (
        <div className="space-y-6">

          {/* How it works */}
          <PortalSurface tone="subtle" padding="sm">
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-white/35" />
              <div className="text-xs text-slate-500 leading-relaxed dark:text-white/50">
                <p className="font-medium text-slate-700 dark:text-white/80 mb-1">Como funciona</p>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <span className="flex items-center gap-1.5"><SectionNumber n={1} /> Credenciais conectam esta plataforma à API de trading</span>
                  <ArrowRight className="hidden h-3 w-3 text-slate-300 dark:text-white/20 sm:block" />
                  <ArrowDown className="h-3 w-3 text-slate-300 dark:text-white/20 sm:hidden" />
                  <span className="flex items-center gap-1.5"><SectionNumber n={2} /> A API de trading envia eventos de volta via webhook</span>
                  <ArrowRight className="hidden h-3 w-3 text-slate-300 dark:text-white/20 sm:block" />
                  <ArrowDown className="h-3 w-3 text-slate-300 dark:text-white/20 sm:hidden" />
                  <span className="flex items-center gap-1.5"><SectionNumber n={3} /> Vagas controlam se novos pagamentos são liberados</span>
                </div>
              </div>
            </div>
          </PortalSurface>

          {/* SECTION 1: API Credentials */}
          <PortalSection
            title={<span className="flex items-center gap-2"><SectionNumber n={1} /> <Shield className="h-4 w-4" /> Credenciais da API de Trading</span>}
            description="Conexão entre esta plataforma e api.everwin.trade. Usadas para criar contas, alterar saldos e bloquear usuários na corretora."
          >
            <div className="space-y-5">
              <SecretField label="Bearer Token do Admin" description="Token JWT para autenticar chamadas à API da corretora." value={bearer} onChange={setBearer} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." stored={stored.everwin_admin_bearer} />
              <SecretField label="Segredo do Webhook" description="Chave compartilhada para validar webhooks recebidos." value={webhookSecret} onChange={setWebhookSecret} placeholder="meu-segredo-webhook..." stored={stored.everwin_webhook_secret} />
              {feedbackApi && <InlineFeedback feedback={feedbackApi} />}
              <Button type="button" onClick={() => void handleSaveApi()} disabled={savingApi} className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500">
                {savingApi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar Credenciais
              </Button>
            </div>
          </PortalSection>

          {/* SECTION 2: Webhook */}
          <PortalSection
            title={<span className="flex items-center gap-2"><SectionNumber n={2} /> <Webhook className="h-4 w-4" /> Webhook — Eventos da Corretora</span>}
            description="A corretora envia notificações para cá quando algo acontece na conta do trader."
          >
            <div className="space-y-4">
              <PortalSurface tone="subtle" padding="sm">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/40">Configure na corretora</p>
                <p className="mb-3 text-xs text-slate-500 dark:text-white/40">Copie estes valores e cole no painel da Everwin Trade.</p>
                <div className="space-y-3">
                  <CopyBlock label="URL do Endpoint" value="https://everwin.trade/prop/api/deposit" />
                  <CopyBlock label="Método" value="POST" />
                  <CopyBlock label="Header de Autenticação" value="X-Webhook-Secret: {seu-segredo}" />
                </div>
              </PortalSurface>

              <PortalSurface tone="subtle" padding="sm">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/40">Eventos Suportados</p>
                <ul className="space-y-2">
                  {[
                    { type: "Login", tone: "info" as const, desc: "Registrado para auditoria — nenhuma ação automática" },
                    { type: "Trade Completed", tone: "success" as const, desc: "Registrado para auditoria — nenhuma ação automática" },
                    { type: "Deposit Created", tone: "danger" as const, desc: "Bloqueia a conta imediatamente + registra nota" },
                    { type: "Withdrawal Created", tone: "danger" as const, desc: "Bloqueia a conta imediatamente + registra nota" },
                  ].map((item) => (
                    <li key={item.type} className="flex items-start gap-2">
                      <PortalStatusPill tone={item.tone} className="mt-0.5 shrink-0">{item.type}</PortalStatusPill>
                      <span className="text-xs text-slate-600 dark:text-white/60">{item.desc}</span>
                    </li>
                  ))}
                </ul>
              </PortalSurface>

              <PortalSurface className="border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10" padding="sm">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  <strong>Bloqueio automático:</strong> Qualquer depósito ou saque detectado bloqueia a conta do trader imediatamente.
                </p>
              </PortalSurface>

              {webhookResult && <InlineFeedback feedback={webhookResult} />}

              <Button type="button" variant="outline" onClick={() => void handleTestWebhook()} disabled={testingWebhook} className="h-10 w-full rounded-xl border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-[#171a23] dark:text-white/70 dark:hover:border-white/[0.12] dark:hover:text-white">
                {testingWebhook ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Testar Conexão do Webhook
              </Button>
            </div>
          </PortalSection>

          {/* SECTION 3: Vagas */}
          <PortalSection
            title={<span className="flex items-center gap-2"><SectionNumber n={3} /> <Lock className="h-4 w-4" /> Controle de Vagas</span>}
            description="Controla se novos links de pagamento são liberados para candidatos aprovados."
          >
            <div className="space-y-4">
              <PortalSurface tone="subtle" className={cn(vacanciesLocked ? "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10" : "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10")}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {vacanciesLocked ? <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" /> : <Unlock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{vacanciesLocked ? "Vagas trancadas" : "Vagas abertas"}</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-white/50">
                      {vacanciesLocked ? "Novas inscrições continuam sendo recebidas, mas links de pagamento NÃO são enviados." : "Links de pagamento podem ser enviados manualmente."}
                    </p>
                  </div>
                  <PortalStatusPill tone={vacanciesLocked ? "warning" : "success"}>{vacanciesLocked ? "Trancado" : "Aberto"}</PortalStatusPill>
                </div>
              </PortalSurface>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button type="button" variant="outline" className={cn("h-10 gap-2 rounded-xl border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-[#171a23] dark:text-white/70 dark:hover:border-white/[0.12]", vacanciesLocked && "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400")} onClick={() => setVacanciesLocked(true)}>
                  <Lock className="h-3.5 w-3.5" /> Trancar Vagas
                </Button>
                <Button type="button" variant="outline" className={cn("h-10 gap-2 rounded-xl border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-[#171a23] dark:text-white/70 dark:hover:border-white/[0.12]", !vacanciesLocked && "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400")} onClick={() => setVacanciesLocked(false)}>
                  <Unlock className="h-3.5 w-3.5" /> Abrir Vagas
                </Button>
              </div>

              <PortalField label="Mensagem pública" hint="Exibida na página de status do candidato quando as vagas estão trancadas.">
                <Textarea value={vacanciesMessage} onChange={(e) => setVacanciesMessage(e.target.value)} className="min-h-[104px] rounded-xl border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white" />
              </PortalField>

              {feedbackVagas && <InlineFeedback feedback={feedbackVagas} />}

              <Button type="button" onClick={() => void handleSaveVagas()} disabled={savingVagas} className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500">
                {savingVagas ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar Regras de Vagas
              </Button>
            </div>
          </PortalSection>
        </div>
      )}
    </div>
  );
}
