import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Ban, CheckCircle2, Layers3, PackageOpen, RefreshCw, TriangleAlert, Upload } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { fetchPoolApi, importPoolApi, updatePoolAccountApi } from "../../api";
import { CopyButton } from "../components/shared/CopyButton";
import { PasswordField } from "../components/shared/PasswordField";
import {
  PortalEmptyState,
  PortalFeedback,
  PortalFilterBar,
  PortalFilterChip,
  PortalLoadingState,
  PortalPageHeader,
  PortalPagination,
  PortalSearchInput,
  PortalSection,
  PortalStatCard,
  PortalStatusPill,
  PortalSurface,
} from "../../portal-ui";
import type { PoolAccount, PoolImportRow, PoolStockRow } from "../../types";

const PAGE_SIZE = 15;
/** Below this, the plan is one sale away from falling back to live provisioning. */
const LOW_STOCK = 5;

type StatusFilter = "all" | "available" | "assigned" | "disabled";

const REQUIRED_COLUMNS = ["identifier", "username", "email", "password", "planId", "accountSize", "currency"];

/** Parses prop-pool-credentials.csv exactly as the generator writes it. */
function parsePoolCsv(text: string): { rows: PoolImportRow[]; error?: string } {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return { rows: [], error: "CSV vazio ou sem linhas de dados." };

  const headers = lines[0].split(",").map((h) => h.trim());
  const missing = REQUIRED_COLUMNS.filter((column) => !headers.includes(column));
  if (missing.length > 0) {
    return { rows: [], error: `Faltam colunas no CSV: ${missing.join(", ")}` };
  }

  const rows: PoolImportRow[] = [];
  for (const line of lines.slice(1)) {
    const cells = line.split(",").map((c) => c.trim());
    const record = Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""])) as Record<string, string>;
    if (!record.identifier || !record.email) continue;

    rows.push({
      identifier: record.identifier,
      username: record.username,
      email: record.email,
      password: record.password,
      planId: record.planId,
      accountSize: Number(record.accountSize),
      currency: record.currency,
      platformUserId: record.platformUserId || undefined,
    });
  }

  if (rows.length === 0) return { rows: [], error: "Nenhuma linha válida encontrada." };
  return { rows };
}

export function AdminPoolPage() {
  const [accounts, setAccounts] = useState<PoolAccount[]>([]);
  const [stock, setStock] = useState<PoolStockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);

  const deferredQuery = useDeferredValue(query);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchPoolApi();
      setAccounts(data.accounts);
      setStock(data.stock);
    } catch (error) {
      setFeedback({ ok: false, message: error instanceof Error ? error.message : "Falha ao carregar o estoque." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleFile = async (file: File) => {
    setBusy(true);
    setFeedback(null);
    try {
      const { rows, error } = parsePoolCsv(await file.text());
      if (error) {
        setFeedback({ ok: false, message: error });
        return;
      }

      // Chunked: a full pool in one request outlives the serverless timeout.
      const CHUNK = 20;
      let inserted = 0;
      let updated = 0;
      let skipped = 0;

      for (let i = 0; i < rows.length; i += CHUNK) {
        const batch = rows.slice(i, i + CHUNK);
        const result = await importPoolApi(batch);
        inserted += result.inserted;
        updated += result.updated;
        skipped += result.skipped.length;
        setFeedback({
          ok: true,
          message: `Importando... ${Math.min(i + CHUNK, rows.length)} de ${rows.length}`,
        });
      }

      const parts = [`${inserted} novas`, `${updated} atualizadas`];
      if (skipped > 0) parts.push(`${skipped} ignoradas`);
      setFeedback({ ok: true, message: `Importação concluída: ${parts.join(", ")}.` });
      await load();
    } catch (error) {
      setFeedback({ ok: false, message: error instanceof Error ? error.message : "Falha ao importar." });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const toggleStatus = async (account: PoolAccount) => {
    setBusy(true);
    try {
      await updatePoolAccountApi(account.id, account.status === "disabled" ? "available" : "disabled");
      await load();
    } catch (error) {
      setFeedback({ ok: false, message: error instanceof Error ? error.message : "Falha ao alterar status." });
    } finally {
      setBusy(false);
    }
  };

  const totals = useMemo(
    () => ({
      total: accounts.length,
      available: accounts.filter((a) => a.status === "available").length,
      assigned: accounts.filter((a) => a.status === "assigned").length,
      lowPlans: stock.filter((s) => s.available < LOW_STOCK).length,
    }),
    [accounts, stock],
  );

  const filtered = useMemo(() => {
    const text = deferredQuery.trim().toLowerCase();
    return accounts.filter((account) => {
      if (statusFilter !== "all" && account.status !== statusFilter) return false;
      if (planFilter !== "all" && account.planId !== planFilter) return false;
      if (!text) return true;
      return `${account.identifier} ${account.email} ${account.username}`.toLowerCase().includes(text);
    });
  }, [accounts, deferredQuery, planFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Estoque de contas"
        title="Estoque"
        description="Contas criadas na corretora, prontas para serem atribuídas quando um pagamento é aprovado."
        actions={
          <div className="flex gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              className="h-9 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-[#171a23] dark:text-white/70"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Importar CSV
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={busy}
              className="h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={() => void load()}
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        }
        meta={
          totals.lowPlans > 0 ? (
            <PortalStatusPill tone="warning">{totals.lowPlans} plano(s) com estoque baixo</PortalStatusPill>
          ) : (
            <PortalStatusPill tone="success">Estoque saudável</PortalStatusPill>
          )
        }
      />

      <PortalSurface tone="subtle" padding="sm">
        <p className="text-xs leading-relaxed text-slate-600 dark:text-white/55">
          Suba o arquivo <code className="rounded bg-slate-200/70 px-1 py-0.5 font-mono text-[11px] dark:bg-white/10">prop-pool-credentials.csv</code>{" "}
          gerado pelo script. As senhas são cifradas ao entrar no banco. Contas já atribuídas a um cliente nunca são
          sobrescritas por uma reimportação.
        </p>
      </PortalSurface>

      {feedback ? <PortalFeedback ok={feedback.ok} message={feedback.message} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard label="Total" value={totals.total} tone="neutral" icon={<Layers3 className="h-4 w-4" />} />
        <PortalStatCard
          label="Disponíveis"
          value={totals.available}
          tone={totals.available > 0 ? "success" : "danger"}
          icon={<PackageOpen className="h-4 w-4" />}
        />
        <PortalStatCard label="Atribuídas" value={totals.assigned} tone="info" icon={<CheckCircle2 className="h-4 w-4" />} />
        <PortalStatCard
          label="Planos em alerta"
          value={totals.lowPlans}
          tone={totals.lowPlans > 0 ? "warning" : "neutral"}
          icon={<TriangleAlert className="h-4 w-4" />}
        />
      </div>

      <PortalSection title="Estoque por plano" description={`Alerta abaixo de ${LOW_STOCK} contas disponíveis`}>
        {loading ? (
          <PortalLoadingState title="Carregando estoque..." lines={3} />
        ) : stock.length === 0 ? (
          <PortalEmptyState title="Sem planos" description="Nenhum plano cadastrado." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stock.map((row) => (
              <button
                key={row.planId}
                type="button"
                onClick={() => {
                  setPlanFilter(row.planId === planFilter ? "all" : row.planId);
                  setPage(1);
                }}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  planFilter === row.planId
                    ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/[0.07] dark:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.planName}</p>
                  <PortalStatusPill tone={row.available === 0 ? "danger" : row.available < LOW_STOCK ? "warning" : "success"}>
                    {row.available}
                  </PortalStatusPill>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                  {row.assigned} atribuídas · {row.disabled} inativas
                </p>
              </button>
            ))}
          </div>
        )}
      </PortalSection>

      <PortalSection title="Contas" description="Credenciais do estoque">
        <div className="space-y-4">
          <PortalFilterBar>
            <PortalSearchInput
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder="Buscar identificador, e-mail ou login"
            />
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: "all", label: "Todas" },
                  { key: "available", label: "Disponíveis" },
                  { key: "assigned", label: "Atribuídas" },
                  { key: "disabled", label: "Inativas" },
                ] as Array<{ key: StatusFilter; label: string }>
              ).map((entry) => (
                <PortalFilterChip
                  key={entry.key}
                  active={statusFilter === entry.key}
                  onClick={() => {
                    setStatusFilter(entry.key);
                    setPage(1);
                  }}
                >
                  {entry.label}
                </PortalFilterChip>
              ))}
              {planFilter !== "all" ? (
                <PortalFilterChip active onClick={() => setPlanFilter("all")}>
                  Limpar plano
                </PortalFilterChip>
              ) : null}
            </div>
          </PortalFilterBar>

          {loading ? (
            <PortalLoadingState title="Carregando contas..." lines={5} />
          ) : pageItems.length === 0 ? (
            <PortalEmptyState
              title="Estoque vazio"
              description="Importe o prop-pool-credentials.csv para abastecer o estoque."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200 text-left dark:border-white/[0.07]">
                      {["Identificador", "Login / E-mail", "Senha", "Plano", "Status", "Ação"].map((header) => (
                        <th
                          key={header}
                          className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 first:pl-0 last:pr-0 dark:text-white/40"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((account) => (
                      <tr key={account.id} className="border-b border-slate-100 last:border-b-0 dark:border-white/[0.05]">
                        <td className="py-4 pr-3 pl-0">
                          <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{account.identifier}</p>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm text-slate-900 dark:text-white">{account.username}</p>
                              <p className="truncate text-xs text-slate-500 dark:text-white/40">{account.email}</p>
                            </div>
                            <CopyButton value={account.email} variant="chip" label="Copiar" copiedLabel="Copiado" />
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          {account.password ? (
                            <PasswordField value={account.password} showLabel="Ver" hideLabel="Ocultar" copyable className="p-0 bg-transparent" />
                          ) : (
                            <span className="text-xs text-amber-600 dark:text-amber-400">ilegível</span>
                          )}
                        </td>
                        <td className="px-3 py-4">
                          <p className="text-sm text-slate-700 dark:text-white/70">
                            {account.accountSize.toLocaleString("pt-BR")} {account.currency}
                          </p>
                        </td>
                        <td className="px-3 py-4">
                          <PortalStatusPill
                            tone={account.status === "available" ? "success" : account.status === "assigned" ? "info" : "neutral"}
                          >
                            {account.status === "available" ? "Disponível" : account.status === "assigned" ? "Atribuída" : "Inativa"}
                          </PortalStatusPill>
                        </td>
                        <td className="px-3 py-4 pr-0">
                          {account.status === "assigned" ? (
                            <span className="text-xs text-slate-400 dark:text-white/30">em uso</span>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              className="h-8 rounded-lg border-slate-200 bg-white text-xs text-slate-600 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-[#171a23] dark:text-white/60"
                              onClick={() => void toggleStatus(account)}
                            >
                              <Ban className="h-3 w-3" />
                              {account.status === "disabled" ? "Reativar" : "Desativar"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <PortalPagination
                page={safePage}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </PortalSection>
    </div>
  );
}
