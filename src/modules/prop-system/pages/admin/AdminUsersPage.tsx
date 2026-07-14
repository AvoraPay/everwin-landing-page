import { useDeferredValue, useMemo, useState } from "react";
import { KeyRound, ShieldCheck, UserPlus2, Users2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { usePropSystem } from "../../context";
import { currencyBRL, formatPropDate } from "../../rules";
import {
  PortalConfirmDialog,
  PortalEmptyState,
  PortalField,
  PortalFilterBar,
  PortalFilterChip,
  PortalPageHeader,
  PortalPagination,
  PortalSearchInput,
  PortalSection,
  PortalStatCard,
  PortalStatusPill,
  PortalSurface,
} from "../../portal-ui";

type StatusFilter = "all" | "active" | "blocked";

const PAGE_SIZE = 8;

const inputClass = "h-10 rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-900 focus-visible:ring-slate-900/10 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus-visible:border-emerald-500 dark:focus-visible:ring-emerald-500/20";

export function AdminUsersPage() {
  const { state, createClientUser, updateUserStatus } = usePropSystem();
  const { i18n } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [statusAction, setStatusAction] = useState<{ id: string; name: string; next: "active" | "blocked" } | null>(null);

  const deferredQuery = useDeferredValue(query);

  const clients = useMemo(() => state.users.filter((user) => user.role === "client"), [state.users]);
  const usersWithStats = useMemo(() => {
    return clients.map((user) => {
      const accounts = state.accounts.filter((account) => account.userId === user.id);
      const activeAccounts = accounts.filter((account) => account.status === "active").length;
      const balance = accounts.reduce((sum, account) => sum + account.balance, 0);

      return { user, accounts, activeAccounts, balance };
    });
  }, [clients, state.accounts]);

  const filteredUsers = useMemo(() => {
    return usersWithStats.filter((entry) => {
      if (statusFilter !== "all" && entry.user.status !== statusFilter) return false;
      if (!deferredQuery.trim()) return true;
      const text = [entry.user.name, entry.user.email, entry.user.primaryEmail].filter(Boolean).join(" ").toLowerCase();
      return text.includes(deferredQuery.trim().toLowerCase());
    });
  }, [deferredQuery, statusFilter, usersWithStats]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeClients = clients.filter((u) => u.status === "active").length;
  const blockedClients = clients.filter((u) => u.status === "blocked").length;
  const clientsWithAccounts = usersWithStats.filter((e) => e.accounts.length > 0).length;
  const liveExposure = state.accounts.reduce((sum, a) => sum + a.balance, 0);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    const result = await createClientUser({ name, email, password: password.trim() || undefined });
    if (!result.ok) { setFeedback(result.message); return; }
    setName(""); setEmail(""); setPassword("");
    setFeedback(result.temporaryPassword ? `Cliente criado. Senha temporária: ${result.temporaryPassword}` : "Cliente criado.");
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Admin"
        title="Clientes"
        description="Identidade • Acesso • Status"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard label="Total" value={clients.length} tone="neutral" icon={<Users2 className="h-4 w-4" />} />
        <PortalStatCard label="Ativos" value={activeClients} tone="success" icon={<ShieldCheck className="h-4 w-4" />} />
        <PortalStatCard label="Bloqueados" value={blockedClients} tone={blockedClients > 0 ? "warning" : "neutral"} icon={<KeyRound className="h-4 w-4" />} />
        <PortalStatCard label="Saldo" value={currencyBRL(liveExposure, i18n.language)} helper={clientsWithAccounts > 0 ? `${clientsWithAccounts} vinculados` : undefined} tone="info" icon={<UserPlus2 className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <PortalSection title="Novo Cliente">
          <form className="space-y-4" onSubmit={handleCreate}>
            <PortalField label="Nome">
              <Input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
            </PortalField>
            <PortalField label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
            </PortalField>
            <PortalField label="Senha" hint="Gerada automaticamente se vazio.">
              <Input value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            </PortalField>

            {feedback ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                {feedback}
              </div>
            ) : null}

            <Button type="submit" className="h-10 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500">
              Criar Cliente
            </Button>
          </form>
        </PortalSection>

        <PortalSurface padding="none">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-white/[0.07]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/40">Registro de clientes</p>
            <h2 className="mt-2 font-bricolage_grotesque text-[24px] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">Clientes</h2>
          </div>

          <div className="p-5">
            <PortalFilterBar>
              <PortalSearchInput value={query} onChange={(v) => { setQuery(v); setPage(1); }} placeholder="Buscar nome ou email" />
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all" as const, label: "Todos" },
                  { key: "active" as const, label: "Ativos" },
                  { key: "blocked" as const, label: "Bloqueados" },
                ].map((f) => (
                  <PortalFilterChip key={f.key} active={statusFilter === f.key} onClick={() => { setStatusFilter(f.key); setPage(1); }}>
                    {f.label}
                  </PortalFilterChip>
                ))}
              </div>
            </PortalFilterBar>
          </div>

          {pageItems.length === 0 ? (
            <div className="px-5 pb-5">
              <PortalEmptyState title="Nenhum Cliente" description="Ajuste os filtros ou busca." />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto px-5">
                <table className="min-w-full table-fixed">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/[0.07]">
                      {["Cliente", "Contato", "Contas", "Saldo", "Status", "Ação"].map((h) => (
                        <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/40 first:pl-0 last:pr-0">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((entry) => (
                      <tr key={entry.user.id} className="border-b border-slate-100 last:border-b-0 dark:border-white/[0.05]">
                        <td className="px-3 py-4 pl-0">
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">{entry.user.name}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-white/40">Desde {formatPropDate(entry.user.createdAt, i18n.language)}</p>
                        </td>
                        <td className="px-3 py-4">
                          <p className="text-sm text-slate-900 dark:text-white/80">{entry.user.email}</p>
                          {entry.user.primaryEmail ? <p className="mt-1 text-xs text-slate-500 dark:text-white/40">Principal: {entry.user.primaryEmail}</p> : null}
                        </td>
                        <td className="px-3 py-4">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{entry.accounts.length}</p>
                          <p className="text-xs text-slate-500 dark:text-white/40">{entry.activeAccounts} Ativas</p>
                        </td>
                        <td className="px-3 py-4 text-sm font-medium text-slate-900 dark:text-white">{currencyBRL(entry.balance, i18n.language)}</td>
                        <td className="px-3 py-4">
                          <PortalStatusPill tone={entry.user.status === "active" ? "success" : "danger"}>
                            {entry.user.status === "active" ? "Ativo" : "Bloqueado"}
                          </PortalStatusPill>
                        </td>
                        <td className="px-3 py-4 pr-0">
                          <Button
                            type="button" variant="outline" size="sm"
                            className="h-9 rounded-lg border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-[#171a23] dark:text-white/70 dark:hover:border-white/[0.12] dark:hover:text-white"
                            onClick={() => setStatusAction({ id: entry.user.id, name: entry.user.name, next: entry.user.status === "active" ? "blocked" : "active" })}
                          >
                            {entry.user.status === "active" ? "Bloquear" : "Restaurar"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PortalPagination page={safePage} totalPages={totalPages} totalItems={filteredUsers.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
            </>
          )}
        </PortalSurface>
      </div>

      <PortalConfirmDialog
        open={!!statusAction}
        onOpenChange={(o) => { if (!o) setStatusAction(null); }}
        title={statusAction?.next === "blocked" ? "Bloquear Cliente" : "Restaurar Cliente"}
        description={statusAction ? statusAction.next === "blocked" ? `Bloquear ${statusAction.name}?` : `Restaurar ${statusAction.name}?` : ""}
        confirmLabel={statusAction?.next === "blocked" ? "Bloquear" : "Restaurar"}
        tone={statusAction?.next === "blocked" ? "danger" : "info"}
        onConfirm={async () => {
          if (!statusAction) return;
          await updateUserStatus(statusAction.id, statusAction.next);
          setStatusAction(null);
        }}
      />
    </div>
  );
}
