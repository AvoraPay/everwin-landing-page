import { useCallback, useEffect, useMemo, useState } from "react";
import { AtSign, Info, Loader2, Lock, Mail, Save, Send, TriangleAlert } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Select } from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import { cn } from "../../../../lib/utils";
import { fetchEmailEventsApi, fetchSettingsApi, sendTestEmailApi, updateSettingsApi } from "../../api";
import { usePropSystem } from "../../context";
import type { EmailEventSetting, EmailLocale, EmailTestResult, SystemSetting } from "../../types";
import {
  PortalPageHeader,
  PortalSection,
  PortalField,
  PortalSurface,
  PortalStatusPill,
  PortalLoadingState,
} from "../../portal-ui";

const inputClass =
  "h-10 rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-900 focus-visible:ring-slate-900/10 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus-visible:border-emerald-500 dark:focus-visible:ring-emerald-500/20";

const textareaClass =
  "min-h-[88px] rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30";

const LOCALE_OPTIONS: Array<{ value: EmailLocale; label: string }> = [
  { value: "pt", label: "PT" },
  { value: "en", label: "EN" },
  { value: "es", label: "ES" },
];

type SenderDraft = { name: string; address: string; replyTo: string };

const EMPTY_SENDER: SenderDraft = { name: "", address: "", replyTo: "" };

/** Mirrors resolveSender() in server/emails.js so the preview cannot lie. */
function previewFrom(sender: SenderDraft) {
  const name = sender.name.trim();
  const address = sender.address.trim();
  if (name && address) return `${name} <${address}>`;
  if (address) return address;
  return "Remetente padrão do servidor (RESEND_FROM_EMAIL)";
}

function InlineFeedback({ feedback }: { feedback: { ok: boolean; message: string } }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm font-medium",
        feedback.ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400",
      )}
    >
      {feedback.message}
    </div>
  );
}

/** Local switch: the project has no Switch primitive and this needs no dependency. */
function EventToggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#181b24]",
        checked ? "bg-emerald-600" : "bg-slate-200 dark:bg-white/10",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function EventRow({
  event,
  enabled,
  note,
  onToggle,
  onNoteChange,
}: {
  event: EmailEventSetting;
  enabled: boolean;
  note: string;
  onToggle: (value: boolean) => void;
  onNoteChange: (value: string) => void;
}) {
  return (
    <PortalSurface tone="subtle" padding="sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{event.label}</p>
            {event.alwaysOn ? (
              <PortalStatusPill tone="info">Sempre ativo</PortalStatusPill>
            ) : (
              <PortalStatusPill tone={enabled ? "success" : "neutral"}>{enabled ? "Ativo" : "Desligado"}</PortalStatusPill>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-white/45">{event.description}</p>
          <code className="mt-1.5 inline-block font-mono text-[11px] text-slate-400 dark:text-white/30">{event.kind}</code>
        </div>
        <EventToggle
          checked={event.alwaysOn ? true : enabled}
          disabled={event.alwaysOn}
          label={`Ativar ${event.label}`}
          onChange={onToggle}
        />
      </div>

      {event.alwaysOn ? (
        <p className="mt-3 flex items-start gap-2 text-xs text-slate-500 dark:text-white/45">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Entrega de credenciais e recuperação de senha não podem ser desligadas: sem elas o cliente que pagou fica sem
          acesso e ninguém consegue redefinir a própria senha.
        </p>
      ) : null}

      {/* The only event that ships off — say why, or the next admin just turns it on. */}
      {!event.alwaysOn && !event.defaultEnabled ? (
        <PortalSurface
          padding="sm"
          className="mt-3 border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10"
        >
          <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Este evento vem <strong>desligado de fábrica</strong>. Ele dispara a cada mudança de status de conta, e uma
              única execução ruim da sincronização noturna mandaria e-mail para todos os traders de uma vez. Só ligue
              depois de confirmar que a sincronização está estável.
            </span>
          </p>
        </PortalSurface>
      ) : null}

      <div className="mt-3">
        <PortalField
          label="Observação personalizada"
          hint="Vai em destaque no corpo deste e-mail. Deixe vazio para enviar só o texto padrão."
        >
          <Textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Ex.: o suporte responde de segunda a sexta, das 9h às 18h."
            className={textareaClass}
          />
        </PortalField>
      </div>
    </PortalSurface>
  );
}

export function AdminEmailSettingsPage() {
  const { currentUser } = usePropSystem();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [events, setEvents] = useState<EmailEventSetting[]>([]);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const [sender, setSender] = useState<SenderDraft>(EMPTY_SENDER);
  const [storedSender, setStoredSender] = useState<SenderDraft>(EMPTY_SENDER);

  const [savingSender, setSavingSender] = useState(false);
  const [senderFeedback, setSenderFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [savingEvents, setSavingEvents] = useState(false);
  const [eventsFeedback, setEventsFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const [testTo, setTestTo] = useState("");
  const [testKind, setTestKind] = useState("");
  const [testLocale, setTestLocale] = useState<EmailLocale>("pt");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<EmailTestResult | null>(null);

  // One hydration path for both the first load and every refresh after a save,
  // so the two can never drift apart.
  const load = useCallback(async () => {
    const [settings, list] = await Promise.all([fetchSettingsApi(), fetchEmailEventsApi()]);

    const applySettings = (map: Record<string, SystemSetting>): SenderDraft => ({
      name: map.email_sender_name?.preview ?? "",
      address: map.email_sender_address?.preview ?? "",
      replyTo: map.email_reply_to?.preview ?? "",
    });

    const nextSender = applySettings(settings);
    setSender(nextSender);
    setStoredSender(nextSender);

    setEvents(list);
    setEnabled(Object.fromEntries(list.map((event) => [event.kind, event.enabled])));
    setNotes(Object.fromEntries(list.map((event) => [event.kind, event.note])));
    setTestKind((current) => (current && list.some((event) => event.kind === current) ? current : (list[0]?.kind ?? "")));
  }, []);

  useEffect(() => {
    load()
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Falha ao carregar as configurações."))
      .finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    setTestTo((current) => current || currentUser?.primaryEmail || currentUser?.email || "");
  }, [currentUser]);

  const senderDirty =
    sender.name.trim() !== storedSender.name.trim() ||
    sender.address.trim() !== storedSender.address.trim() ||
    sender.replyTo.trim() !== storedSender.replyTo.trim();

  const eventsDirty = useMemo(
    () =>
      events.some(
        (event) =>
          (enabled[event.kind] ?? event.enabled) !== event.enabled ||
          (notes[event.kind] ?? "").trim() !== event.note.trim(),
      ),
    [events, enabled, notes],
  );

  const handleSaveSender = async () => {
    setSavingSender(true);
    setSenderFeedback(null);
    try {
      await updateSettingsApi({
        email_sender_name: sender.name.trim(),
        email_sender_address: sender.address.trim(),
        email_reply_to: sender.replyTo.trim(),
      });
      await load();
      setSenderFeedback({ ok: true, message: "Remetente salvo. Envie um teste para confirmar que o domínio entrega." });
    } catch (err) {
      setSenderFeedback({ ok: false, message: err instanceof Error ? err.message : "Falha ao salvar." });
    } finally {
      setSavingSender(false);
    }
  };

  const handleSaveEvents = async () => {
    setSavingEvents(true);
    setEventsFeedback(null);
    try {
      const updates: Record<string, string> = {};
      for (const event of events) {
        // alwaysOn events have no enabledKey — there is nothing to write.
        if (event.enabledKey) updates[event.enabledKey] = String(enabled[event.kind] ?? event.enabled);
        updates[event.noteKey] = (notes[event.kind] ?? "").trim();
      }
      await updateSettingsApi(updates);
      await load();
      setEventsFeedback({ ok: true, message: "Eventos salvos." });
    } catch (err) {
      setEventsFeedback({ ok: false, message: err instanceof Error ? err.message : "Falha ao salvar." });
    } finally {
      setSavingEvents(false);
    }
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    setTestResult(null);
    try {
      setTestResult(await sendTestEmailApi({ to: testTo.trim(), kind: testKind, locale: testLocale }));
    } catch (err) {
      setTestResult({ ok: false, message: err instanceof Error ? err.message : "Falha ao enviar o e-mail de teste." });
    } finally {
      setSendingTest(false);
    }
  };

  const activeCount = events.filter((event) => event.alwaysOn || (enabled[event.kind] ?? event.enabled)).length;

  return (
    <div className="space-y-8">
      <PortalPageHeader
        eyebrow="Configurações do admin"
        title="Notificações por e-mail"
        description="Quem assina os e-mails, quais eventos disparam envio e o que cada mensagem diz a mais."
        meta={
          loading ? undefined : (
            <PortalStatusPill tone="neutral">
              {activeCount} de {events.length} eventos ativos
            </PortalStatusPill>
          )
        }
      />

      {loading ? (
        <PortalLoadingState title="Carregando notificações..." lines={3} />
      ) : (
        <div className="space-y-6">
          {loadError ? <InlineFeedback feedback={{ ok: false, message: loadError }} /> : null}

          {/* SECTION 1: sender identity */}
          <PortalSection
            title={
              <span className="flex items-center gap-2">
                <AtSign className="h-4 w-4" /> Remetente
              </span>
            }
            description="Aparece no From e no Reply-To de todo e-mail transacional. Campos vazios voltam ao padrão configurado no servidor."
          >
            <div className="space-y-5">
              <PortalField label="Nome do remetente" hint="O nome que o destinatário vê antes do endereço.">
                <Input
                  value={sender.name}
                  onChange={(e) => setSender((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Everwin Prop"
                  className={inputClass}
                />
              </PortalField>

              <PortalField
                label="Endereço de envio"
                hint="Precisa pertencer a um domínio verificado na Resend, senão a entrega é recusada."
              >
                <Input
                  type="email"
                  value={sender.address}
                  onChange={(e) => setSender((s) => ({ ...s, address: e.target.value }))}
                  placeholder="prop@everwin.capital"
                  className={inputClass}
                />
              </PortalField>

              <PortalField label="Responder para" hint="Para onde vai a resposta do cliente. Vazio usa o endereço de envio.">
                <Input
                  type="email"
                  value={sender.replyTo}
                  onChange={(e) => setSender((s) => ({ ...s, replyTo: e.target.value }))}
                  placeholder="suporte@everwin.capital"
                  className={inputClass}
                />
              </PortalField>

              <PortalSurface tone="subtle" padding="sm">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/40">
                  Como vai chegar
                </p>
                <code className="block truncate font-mono text-xs text-slate-600 dark:text-white/60">
                  {previewFrom(sender)}
                </code>
              </PortalSurface>

              {senderFeedback ? <InlineFeedback feedback={senderFeedback} /> : null}

              <Button
                type="button"
                onClick={() => void handleSaveSender()}
                disabled={savingSender || !senderDirty}
                className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                {savingSender ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar remetente
              </Button>
            </div>
          </PortalSection>

          {/* SECTION 2: per-event switches */}
          <PortalSection
            title={
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Eventos
              </span>
            }
            description="Cada linha é uma notificação que a plataforma pode enviar. Desligar um evento não cancela a ação — só deixa de avisar por e-mail, e o registro fica marcado como ignorado."
          >
            <div className="space-y-4">
              <PortalSurface tone="subtle" padding="sm">
                <p className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-500 dark:text-white/50">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-white/35" />
                  <span>
                    Três eventos não têm chave de desligamento no servidor: entrega do acesso ao portal, entrega da conta
                    de operação e o código de redefinição de senha. Eles são a única forma de o cliente entrar, então
                    nem esta tela nem uma chamada direta à API conseguem desligá-los.
                  </span>
                </p>
              </PortalSurface>

              {events.map((event) => (
                <EventRow
                  key={event.kind}
                  event={event}
                  enabled={enabled[event.kind] ?? event.enabled}
                  note={notes[event.kind] ?? ""}
                  onToggle={(value) => setEnabled((prev) => ({ ...prev, [event.kind]: value }))}
                  onNoteChange={(value) => setNotes((prev) => ({ ...prev, [event.kind]: value }))}
                />
              ))}

              {eventsFeedback ? <InlineFeedback feedback={eventsFeedback} /> : null}

              <Button
                type="button"
                onClick={() => void handleSaveEvents()}
                disabled={savingEvents || !eventsDirty}
                className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                {savingEvents ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar eventos
              </Button>
            </div>
          </PortalSection>

          {/* SECTION 3: test send */}
          <PortalSection
            title={
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" /> Enviar e-mail de teste
              </span>
            }
            description="Dispara um envio real, com dados fictícios, usando o remetente e a observação já salvos. Funciona mesmo com o evento desligado."
          >
            <div className="space-y-5">
              <PortalField label="Destinatário" hint="Sua caixa de entrada. O e-mail sai com o código TESTE-0000.">
                <Input
                  type="email"
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder="voce@everwin.capital"
                  className={inputClass}
                />
              </PortalField>

              <PortalField label="Evento" hint="Qual modelo de e-mail será enviado.">
                <Select value={testKind} onChange={(e) => setTestKind(e.target.value)} className={inputClass}>
                  {events.map((event) => (
                    <option key={event.kind} value={event.kind}>
                      {event.label}
                    </option>
                  ))}
                </Select>
              </PortalField>

              <PortalField label="Idioma" hint="O idioma do e-mail segue o do candidato; aqui você escolhe qual versão testar.">
                <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/[0.07] dark:bg-white/[0.04]">
                  {LOCALE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTestLocale(option.value)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                        testLocale === option.value
                          ? "bg-white text-slate-900 shadow-sm dark:bg-white/[0.10] dark:text-white"
                          : "text-slate-500 hover:text-slate-800 dark:text-white/45 dark:hover:text-white/80",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </PortalField>

              {testResult ? (
                <PortalSurface
                  tone="subtle"
                  padding="sm"
                  className={cn(
                    testResult.ok
                      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                      : "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10",
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {testResult.ok ? (
                      <Send className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                    )}
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          testResult.ok ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400",
                        )}
                      >
                        {testResult.message}
                      </p>
                      {testResult.from ? (
                        <p className="mt-1 truncate text-xs text-slate-600 dark:text-white/50">De: {testResult.from}</p>
                      ) : null}
                      {testResult.replyTo ? (
                        <p className="truncate text-xs text-slate-600 dark:text-white/50">
                          Responder para: {testResult.replyTo}
                        </p>
                      ) : null}
                      {testResult.providerMessageId ? (
                        <p className="mt-1 truncate font-mono text-[11px] text-slate-400 dark:text-white/30">
                          {testResult.providerMessageId}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </PortalSurface>
              ) : null}

              <Button
                type="button"
                variant="outline"
                onClick={() => void handleSendTest()}
                disabled={sendingTest || !testTo.trim() || !testKind}
                className="h-10 w-full rounded-xl border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-[#171a23] dark:text-white/70 dark:hover:border-white/[0.12] dark:hover:text-white"
              >
                {sendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Enviar teste
              </Button>
            </div>
          </PortalSection>
        </div>
      )}
    </div>
  );
}
