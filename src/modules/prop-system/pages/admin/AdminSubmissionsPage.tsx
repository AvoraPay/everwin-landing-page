import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  KeyRound,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  UserRoundCheck,
  Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { usePropSystem } from "../../context";
import {
  fetchSettingsApi,
  fetchPlatformUserApi,
  fetchSubmissionsApi,
  provisionSubmissionAccessApi,
  releasePaymentLinkApi,
  resetPlatformPasswordApi,
  updateSubmissionPaymentApi,
  updateSubmissionStatusApi,
} from "../../api";
import { formatPropDateTime } from "../../rules";
import {
  formatRelativeWait,
  getAccountStatusMeta,
  getPaymentStatusMeta,
  getSubmissionStatusMeta,
} from "../../portal-presentation";
import {
  PortalConfirmDialog,
  PortalDrawer,
  PortalEmptyState,
  PortalField,
  PortalFilterBar,
  PortalFilterChip,
  PortalLoadingState,
  PortalMetricList,
  PortalPageHeader,
  PortalPagination,
  PortalSearchInput,
  PortalSection,
  PortalStatusPill,
  PortalSurface,
  PortalStatCard,
} from "../../portal-ui";
import type { AdminSubmissionListItem } from "../../types";

const DEFAULT_VACANCIES_MESSAGE =
  "Vagas temporariamente fechadas. As inscrições continuam em análise e os links serão enviados manualmente quando houver liberação.";

type FilterKey = "all" | "finance" | "provision" | "access" | "account";
type BatchAction = "review" | "approve" | "reject";

const PAGE_SIZE = 9;

export function AdminSubmissionsPage() {
  const { state } = usePropSystem();
  const { i18n } = useTranslation();

  const [items, setItems] = useState<AdminSubmissionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [platformData, setPlatformData] = useState<Record<string, unknown> | null>(null);
  const [platformLoading, setPlatformLoading] = useState(false);
  const [resetResult, setResetResult] = useState<string | null>(null);
  const [batchConfirm, setBatchConfirm] = useState<BatchAction | null>(null);

  const deferredQuery = useDeferredValue(query);

  const loadSubmissions = async (preferredId?: string | null) => {
    setLoading(true);
    setError(null);

    try {
      const nextItems = await fetchSubmissionsApi();
      setItems(nextItems);
      setDrawerId((current) => {
        const desired = preferredId ?? current;
        if (desired && nextItems.some((item) => item.application.id === desired)) return desired;
        return null;
      });
      setSelectedIds((current) => current.filter((id) => nextItems.some((item) => item.application.id === id)));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Falha ao carregar inscrições.");
    } finally {
      setLoading(false);
    }
  };

  const loadIntakeSettings = async () => {
    try {
      const settings = await fetchSettingsApi();
      void settings;
    } catch {
      // Keep defaults when settings are unavailable.
    }
  };

  useEffect(() => {
    void loadSubmissions();
    void loadIntakeSettings();
  }, []);

  const selectedItem = useMemo(
    () => items.find((item) => item.application.id === drawerId) ?? null,
    [drawerId, items],
  );

  useEffect(() => {
    setCheckoutUrl(selectedItem?.payment?.checkoutUrl ?? "");
    setAdminNotes(selectedItem?.application.adminNotes ?? "");
    setPlatformData(null);
    setResetResult(null);
  }, [selectedItem]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filter === "finance" && !["pending", "overdue"].includes(item.application.paymentStatus)) return false;
      if (filter === "provision" && !(item.application.paymentStatus === "approved" && !item.user)) return false;
      if (filter === "access" && item.application.status !== "access_ready") return false;
      if (filter === "account" && item.application.status !== "account_ready") return false;

      if (!deferredQuery.trim()) return true;
      const text = [
        item.application.submissionCode,
        item.application.fullName,
        item.application.email,
        item.application.documentNumber,
        item.application.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(deferredQuery.trim().toLowerCase());
    });
  }, [deferredQuery, filter, items]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredItems.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const summary = {
    total: items.length,
    finance: items.filter((item) => ["pending", "overdue"].includes(item.application.paymentStatus)).length,
    provision: items.filter((item) => item.application.paymentStatus === "approved" && !item.user).length,
    access: items.filter((item) => item.application.status === "access_ready").length,
    account: items.filter((item) => item.application.status === "account_ready").length,
  };

  const linkedAccount = selectedItem
    ? state.accounts.find((account) => account.applicationId === selectedItem.application.id) ?? null
    : null;

  const handleRowToggle = (applicationId: string) => {
    setSelectedIds((current) =>
      current.includes(applicationId)
        ? current.filter((id) => id !== applicationId)
        : [...current, applicationId],
    );
  };

  const handleTogglePage = () => {
    const pageIds = pageItems.map((item) => item.application.id);
    const everySelected = pageIds.every((id) => selectedIds.includes(id));
    if (everySelected) {
      setSelectedIds((current) => current.filter((id) => !pageIds.includes(id)));
      return;
    }
    setSelectedIds((current) => [...new Set([...current, ...pageIds])]);
  };

  const runAction = async (key: string, action: () => Promise<void>) => {
    setBusyAction(key);
    setError(null);
    try {
      await action();
      await loadSubmissions(selectedItem?.application.id ?? undefined);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Ação falhou.");
    } finally {
      setBusyAction(null);
    }
  };

  const runBatchAction = async (action: BatchAction) => {
    if (selectedIds.length === 0) return;

    await runAction(`batch-${action}`, async () => {
      const targets = items.filter((item) => selectedIds.includes(item.application.id));
      for (const item of targets) {
        if (action === "review") {
          await updateSubmissionStatusApi(item.application.id, {
            status: "under_review",
            adminNotes: item.application.adminNotes,
          });
        }
        if (action === "approve") {
          await updateSubmissionPaymentApi(item.application.id, {
            status: "approved",
            checkoutUrl: item.payment?.checkoutUrl,
            adminNotes: item.application.adminNotes,
          });
        }
        if (action === "reject") {
          await updateSubmissionStatusApi(item.application.id, {
            status: "rejected",
            adminNotes: item.application.adminNotes,
          });
        }
      }
      setSelectedIds([]);
      setBatchConfirm(null);
    });
  };

  const fetchPlatformUser = async (platformUserId: string) => {
    setPlatformLoading(true);
    setPlatformData(null);
    try {
      const response = await fetchPlatformUserApi(platformUserId);
      setPlatformData(response);
    } catch (nextError) {
      setPlatformData({
        error: nextError instanceof Error ? nextError.message : "Falha ao buscar plataforma.",
      });
    } finally {
      setPlatformLoading(false);
    }
  };

  const resetPlatformPassword = async (platformUserId: string) => {
    setBusyAction("reset-platform-password");
    setResetResult(null);
    try {
      const result = await resetPlatformPasswordApi(platformUserId);
      setResetResult(result.temporaryPassword);
    } catch (nextError) {
      setResetResult(nextError instanceof Error ? nextError.message : "Reset failed.");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Inscrições"
        description="Pipeline de candidaturas"
        actions={
          <Button
            type="button"
            size="sm"
            className="h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            onClick={() => {
              void loadSubmissions(drawerId);
              void loadIntakeSettings();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        }
        meta={
          <>
            <PortalStatusPill tone="warning">Abertos: {summary.finance}</PortalStatusPill>
            <PortalStatusPill tone="info">Aguardando: {summary.provision}</PortalStatusPill>
            <PortalStatusPill tone="success">Prontos: {summary.account}</PortalStatusPill>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <PortalStatCard
          label="Total"
          value={summary.total}
          tone="neutral"
          icon={<SearchCheck className="h-4 w-4" />}
        />
        <PortalStatCard
          label="Abertos"
          value={summary.finance}
          tone={summary.finance > 0 ? "warning" : "neutral"}
          icon={<Wallet className="h-4 w-4" />}
        />
        <PortalStatCard
          label="Aguardando Acesso"
          value={summary.provision}
          tone={summary.provision > 0 ? "warning" : "neutral"}
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <PortalStatCard
          label="Acesso"
          value={summary.access}
          tone="info"
          icon={<UserRoundCheck className="h-4 w-4" />}
        />
        <PortalStatCard
          label="Prontos"
          value={summary.account}
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      <PortalSection
        title="Fila de inscrições"
        description="Candidaturas recebidas"
      >
        <div className="space-y-4">
          <PortalFilterBar>
            <PortalSearchInput
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder="Buscar nome, email, doc ou código"
            />
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all" as const, label: "Todas" },
                { key: "finance" as const, label: "Pagamento" },
                { key: "provision" as const, label: "Portal" },
                { key: "access" as const, label: "Acesso" },
                { key: "account" as const, label: "Prontas" },
              ].map((entry) => (
                <PortalFilterChip
                  key={entry.key}
                  active={filter === entry.key}
                  onClick={() => {
                    setFilter(entry.key);
                    setPage(1);
                  }}
                >
                  {entry.label}
                </PortalFilterChip>
              ))}
            </div>
          </PortalFilterBar>

          {selectedIds.length > 0 ? (
            <PortalSurface tone="subtle" className="border-slate-300 dark:border-slate-700">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{selectedIds.length} selecionados</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-lg border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#171a23] dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700"
                    onClick={() => setBatchConfirm("review")}
                  >
                    Revisar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 dark:hover:bg-emerald-400"
                    onClick={() => setBatchConfirm("approve")}
                  >
                    Aprovar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 rounded-lg bg-red-600 text-white hover:bg-red-500 dark:hover:bg-red-400"
                    onClick={() => setBatchConfirm("reject")}
                  >
                    Rejeitar
                  </Button>
                </div>
              </div>
            </PortalSurface>
          ) : null}

          {error ? (
            <PortalSurface tone="subtle" className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              <p className="text-sm font-medium">{error}</p>
            </PortalSurface>
          ) : null}

          {loading ? (
            <PortalLoadingState title="Carregando inscrições..." lines={5} />
          ) : pageItems.length === 0 ? (
            <PortalEmptyState
              title="Nenhum Resultado"
              description="Ajuste os filtros ou busca."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed">
                  <thead>
                    <tr className="border-b border-slate-200 text-left dark:border-white/[0.07]">
                      <th className="w-10 py-3 pr-3">
                        <input
                          type="checkbox"
                          checked={pageItems.length > 0 && pageItems.every((item) => selectedIds.includes(item.application.id))}
                          onChange={handleTogglePage}
                          className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950/10 dark:border-slate-600 dark:bg-[#171a23] dark:text-emerald-500 dark:focus:ring-emerald-500/20"
                        />
                      </th>
                      {["Candidato", "Plano", "Pagamento", "Portal", "Status", "Ação"].map((header) => (
                        <th key={header} className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 first:pl-0 last:pr-0 dark:text-slate-400">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((item) => {
                      const payment = getPaymentStatusMeta(item.application.paymentStatus, i18n.language);
                      const submission = getSubmissionStatusMeta(item.application.status, i18n.language);
                      const linked = state.accounts.find((account) => account.applicationId === item.application.id) ?? null;

                      return (
                        <tr key={item.application.id} className="border-b border-slate-100 last:border-b-0 dark:border-white/[0.07]">
                          <td className="py-4 pr-3 align-top">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.application.id)}
                              onChange={() => handleRowToggle(item.application.id)}
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950/10 dark:border-slate-600 dark:bg-[#171a23] dark:text-emerald-500 dark:focus:ring-emerald-500/20"
                            />
                          </td>
                          <td className="px-3 py-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.application.fullName}</p>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {item.application.submissionCode} · {formatRelativeWait(item.application.submittedAt, i18n.language)}
                              </p>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatPropDateTime(item.application.submittedAt, i18n.language)}</p>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.application.email}</p>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.application.phone}</p>
                              {item.payment?.paymentCode ? (
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Cód: {item.payment.paymentCode}</p>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{item.plan?.name ?? "Plano"}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.plan ? item.plan.accountSize.toLocaleString("pt-BR") : "-"}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {item.application.amount > 0
                                ? `${item.application.currency} ${item.application.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                                : item.plan?.fee
                                ? `${item.plan.fee.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                                : "-"}
                            </p>
                          </td>
                          <td className="px-3 py-4">
                            <div className="space-y-2">
                              <PortalStatusPill tone={payment.tone}>{payment.label}</PortalStatusPill>
                              {item.payment?.checkoutUrl ? (
                                <p className="text-xs text-slate-500 dark:text-slate-400">Link salvo</p>
                              ) : (
                                <p className="text-xs text-slate-500 dark:text-slate-400">Sem link</p>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <div className="space-y-2">
                              {item.user ? (
                                <PortalStatusPill tone="success">Acesso Pronto</PortalStatusPill>
                              ) : (
                                <PortalStatusPill tone="warning">Sem Usuário</PortalStatusPill>
                              )}
                              {linked ? (
                                <p className="text-xs text-slate-500 dark:text-slate-400">Conta {linked.accountId}</p>
                              ) : (
                                <p className="text-xs text-slate-500 dark:text-slate-400">Sem conta</p>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <PortalStatusPill tone={submission.tone}>{submission.label}</PortalStatusPill>
                          </td>
                          <td className="px-3 py-4 pr-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-9 rounded-lg border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#171a23] dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700"
                              onClick={() => setDrawerId(item.application.id)}
                            >
                              Abrir
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <PortalPagination
                page={safePage}
                totalPages={totalPages}
                totalItems={filteredItems.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </PortalSection>

      <PortalDrawer
        open={!!selectedItem}
        onOpenChange={(open) => {
          if (!open) setDrawerId(null);
        }}
        title={selectedItem ? selectedItem.application.fullName : "Inscrição"}
        description={selectedItem ? selectedItem.application.submissionCode : undefined}
      >
        {selectedItem ? (
          <div className="space-y-6">
            {/* Status overview */}
            <div className="flex flex-wrap gap-2">
              <PortalStatusPill tone={getSubmissionStatusMeta(selectedItem.application.status, i18n.language).tone}>
                {getSubmissionStatusMeta(selectedItem.application.status, i18n.language).label}
              </PortalStatusPill>
              <PortalStatusPill tone={getPaymentStatusMeta(selectedItem.application.paymentStatus, i18n.language).tone}>
                {getPaymentStatusMeta(selectedItem.application.paymentStatus, i18n.language).label}
              </PortalStatusPill>
              {linkedAccount ? <PortalStatusPill tone="info">{linkedAccount.accountId}</PortalStatusPill> : null}
            </div>

            {/* Personal info */}
            <PortalSection title="Dados Pessoais" description="Informações fornecidas pelo candidato">
              <PortalMetricList
                items={[
                  { label: "Nome Completo", value: selectedItem.application.fullName, hint: selectedItem.application.submissionCode },
                  { label: "Email", value: selectedItem.application.email },
                  { label: "Telefone", value: selectedItem.application.phone },
                  { label: "Documento", value: `${selectedItem.application.documentType || "Doc"}: ${selectedItem.application.documentNumber || selectedItem.application.cpf || "-"}` },
                  { label: "Cidade", value: selectedItem.application.city },
                  { label: "País", value: selectedItem.application.country },
                  { label: "Idioma", value: selectedItem.application.locale.toUpperCase() },
                  { label: "Profissão", value: selectedItem.application.occupation || "-" },
                ]}
                columns={2}
              />
            </PortalSection>

            {/* Trading profile */}
            <PortalSection title="Perfil de Trading" description="Experiência e perfil declarado">
              <PortalMetricList
                items={[
                  { label: "Experiência", value: selectedItem.application.experience || "-" },
                  { label: "Sessão de Trading", value: selectedItem.application.session || "-" },
                  { label: "Risco por Dia", value: selectedItem.application.riskPerDay || "-" },
                  { label: "Plano Escolhido", value: selectedItem.plan?.name ?? "-", hint: selectedItem.plan ? `${selectedItem.plan.accountSize.toLocaleString("pt-BR")} Capital` : "" },
                ]}
                columns={2}
              />
              {selectedItem.application.motivation ? (
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-white/[0.07] dark:bg-[#171a23]/50">
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Motivação</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{selectedItem.application.motivation}</p>
                </div>
              ) : null}
              {selectedItem.application.consistency ? (
                <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-white/[0.07] dark:bg-[#171a23]/50">
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Consistência</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{selectedItem.application.consistency}</p>
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${selectedItem.application.agreeRules ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-[#171a23] dark:text-slate-400"}`}>
                  {selectedItem.application.agreeRules ? "Regras aceitas" : "Regras pendentes"}
                </span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${selectedItem.application.agreeNoGuarantee ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-[#171a23] dark:text-slate-400"}`}>
                  {selectedItem.application.agreeNoGuarantee ? "Sem garantia aceito" : "Sem garantia pendente"}
                </span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${selectedItem.application.agreeLiability ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-[#171a23] dark:text-slate-400"}`}>
                  {selectedItem.application.agreeLiability ? "Responsabilidade aceita" : "Responsabilidade pendente"}
                </span>
              </div>
            </PortalSection>

            {/* Timeline */}
            <PortalSection title="Datas" description="Timeline da inscrição">
              <PortalMetricList
                items={[
                  { label: "Enviado", value: formatPropDateTime(selectedItem.application.submittedAt, i18n.language), hint: formatRelativeWait(selectedItem.application.submittedAt, i18n.language) },
                  { label: "Criado", value: formatPropDateTime(selectedItem.application.createdAt, i18n.language) },
                  { label: "Atualizado", value: formatPropDateTime(selectedItem.application.updatedAt, i18n.language) },
                  ...(selectedItem.application.paidAt ? [{ label: "Pago", value: formatPropDateTime(selectedItem.application.paidAt, i18n.language) }] : []),
                  ...(selectedItem.application.reviewedAt ? [{ label: "Revisado", value: formatPropDateTime(selectedItem.application.reviewedAt, i18n.language) }] : []),
                  ...(selectedItem.application.paymentDueAt ? [{ label: "Pagamento Vence", value: formatPropDateTime(selectedItem.application.paymentDueAt, i18n.language) }] : []),
                ]}
                columns={2}
              />
            </PortalSection>

            {/* Payment */}
            <PortalSection title="Pagamento" description="Dados do pagamento e checkout">
              <PortalMetricList
                items={[
                  { label: "Código de Pagamento", value: selectedItem.payment?.paymentCode || "-" },
                  { label: "Valor", value: selectedItem.application.amount > 0 ? `${selectedItem.application.currency} ${selectedItem.application.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "-" },
                  { label: "Moeda", value: selectedItem.application.currency || "-" },
                  { label: "Provedor", value: selectedItem.payment?.provider || "-" },
                  { label: "Referência Externa", value: selectedItem.payment?.externalReference || "-" },
                  { label: "Status do Pagamento", value: getPaymentStatusMeta(selectedItem.application.paymentStatus, i18n.language).label },
                ]}
                columns={2}
              />

              <div className="mt-4 space-y-4">
                <PortalField label="Link de checkout">
                  <Input
                    value={checkoutUrl}
                    onChange={(e) => setCheckoutUrl(e.target.value)}
                    className="h-9 rounded-lg border-slate-200 bg-white dark:border-slate-700 dark:bg-[#171a23] dark:text-white"
                    placeholder="https://..."
                  />
                </PortalField>

                <PortalField label="Notas do Admin">
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="min-h-[80px] rounded-lg border-slate-200 bg-white dark:border-slate-700 dark:bg-[#171a23] dark:text-white"
                  />
                </PortalField>

                <div className="grid grid-cols-2 gap-4">
                  <Button type="button" variant="outline" size="sm" className="h-9 rounded-lg border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#171a23] dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700" disabled={busyAction !== null}
                    onClick={() => void runAction("save-checkout", async () => { await updateSubmissionPaymentApi(selectedItem.application.id, { status: selectedItem.application.paymentStatus, checkoutUrl: checkoutUrl || undefined, adminNotes: adminNotes || undefined }); })}>
                    Salvar Link
                  </Button>
                  <Button type="button" size="sm" className="h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500" disabled={busyAction !== null || !checkoutUrl.trim()}
                    onClick={() => void runAction("release-payment", async () => { await releasePaymentLinkApi(selectedItem.application.id, { checkoutUrl: checkoutUrl.trim(), adminNotes: adminNotes || undefined }); })}>
                    <CreditCard className="h-3.5 w-3.5" />
                    Enviar Link
                  </Button>
                  <Button type="button" size="sm" className="h-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 dark:hover:bg-emerald-400" disabled={busyAction !== null}
                    onClick={() => void runAction("approve-payment", async () => { await updateSubmissionPaymentApi(selectedItem.application.id, { status: "approved", checkoutUrl: checkoutUrl || undefined, adminNotes: adminNotes || undefined }); })}>
                    Aprovar
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="h-9 rounded-lg border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#171a23] dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700" disabled={busyAction !== null}
                    onClick={() => void runAction("mark-review", async () => { await updateSubmissionStatusApi(selectedItem.application.id, { status: "under_review", adminNotes: adminNotes || undefined }); })}>
                    Revisar
                  </Button>
                  <Button type="button" size="sm" className="h-9 rounded-lg bg-sky-600 text-white hover:bg-sky-500 dark:hover:bg-sky-400" disabled={busyAction !== null}
                    onClick={() => void runAction("provision-access", async () => { await provisionSubmissionAccessApi(selectedItem.application.id); })}>
                    <KeyRound className="h-3.5 w-3.5" />
                    Criar Acesso
                  </Button>
                  <Button type="button" size="sm" className="h-9 rounded-lg bg-red-600 text-white hover:bg-red-500 dark:hover:bg-red-400" disabled={busyAction !== null}
                    onClick={() => void runAction("mark-rejected", async () => { await updateSubmissionStatusApi(selectedItem.application.id, { status: "rejected", adminNotes: adminNotes || undefined }); })}>
                    Rejeitar
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <a href={`/prop/submission?id=${selectedItem.application.submissionCode}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                    <ExternalLink className="h-3 w-3" /> Página pública
                  </a>
                  {selectedItem.user ? (
                    <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <UserRoundCheck className="h-3 w-3" /> {selectedItem.user.name} · {selectedItem.user.email}
                    </span>
                  ) : null}
                </div>
              </div>
            </PortalSection>

            {/* Linked operation account */}
            {linkedAccount ? (
              <PortalSection title="Conta de Operação" description="Dados da conta vinculada">
                <PortalMetricList
                  items={[
                    { label: "Conta", value: linkedAccount.accountId },
                    { label: "Status", value: getAccountStatusMeta(linkedAccount.status, i18n.language).label },
                    { label: "Login", value: linkedAccount.platformLogin || "-" },
                    { label: "Plataforma", value: linkedAccount.platformName || "-" },
                  ]}
                  columns={2}
                />

                {linkedAccount.platformUserId ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" className="h-9 rounded-lg border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#171a23] dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700" disabled={platformLoading}
                      onClick={() => void fetchPlatformUser(linkedAccount.platformUserId!)}>
                      Buscar Usuário
                    </Button>
                    <Button type="button" size="sm" className="h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500" disabled={busyAction !== null}
                      onClick={() => void resetPlatformPassword(linkedAccount.platformUserId!)}>
                      <KeyRound className="h-3.5 w-3.5" /> Reset Senha
                    </Button>
                  </div>
                ) : null}

                {platformLoading ? <PortalLoadingState title="Carregando..." lines={2} /> : null}

                {platformData ? (
                  <PortalSurface tone="subtle" padding="sm" className="mt-4">
                    <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs leading-5 text-slate-600 dark:text-slate-300">
                      {JSON.stringify(platformData, null, 2)}
                    </pre>
                  </PortalSurface>
                ) : null}

                {resetResult ? (
                  <PortalSurface tone="subtle" padding="sm" className="mt-4">
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Nova senha</p>
                    <p className="mt-1 font-mono text-sm text-slate-950 dark:text-white">{resetResult}</p>
                  </PortalSurface>
                ) : null}
              </PortalSection>
            ) : null}
          </div>
        ) : null}
      </PortalDrawer>

      <PortalConfirmDialog
        open={batchConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setBatchConfirm(null);
        }}
        title={
          batchConfirm === "approve"
            ? "Aprovar em Lote"
            : batchConfirm === "review"
            ? "Revisar em Lote"
            : "Rejeitar em Lote"
        }
        description={selectedIds.length > 0 ? `${selectedIds.length} selecionados. Continuar?` : ""}
        confirmLabel={
          batchConfirm === "approve"
            ? "Aprovar"
            : batchConfirm === "review"
            ? "Revisar"
            : "Rejeitar"
        }
        tone={batchConfirm === "reject" ? "danger" : "info"}
        loading={busyAction !== null}
        onConfirm={() => void (batchConfirm ? runBatchAction(batchConfirm) : Promise.resolve())}
      />
    </div>
  );
}
