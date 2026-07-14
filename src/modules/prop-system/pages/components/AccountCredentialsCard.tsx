import { ExternalLink, KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../../lib/utils";
import { CopyButton } from "./shared/CopyButton";
import { PasswordField } from "./shared/PasswordField";

interface AccountCredentialsCardProps {
  platformLogin: string;
  platformPassword: string;
  platformName?: string;
  brokerName?: string;
  tradeRoomUrl?: string;
}

export function AccountCredentialsCard({
  platformLogin,
  platformPassword,
  platformName,
  brokerName,
  tradeRoomUrl,
}: AccountCredentialsCardProps) {
  const { t } = useTranslation();

  const target = tradeRoomUrl || "https://app.everwin.capital/pt/auth/login";

  return (
    <div className="portal-card overflow-hidden rounded-portal-lg border border-portal-border">
      {/* header */}
      <div className="flex items-center justify-between gap-4 border-b border-portal-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-[11px] border border-emerald-500/30 bg-emerald-500/12">
            <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
          </span>
          <p className="text-sm font-semibold text-white">
            {t("prop_portal.client_accounts.credentials_title")}
          </p>
        </div>
        <a
          href={target}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-portal-xs px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90 bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_4px_14px_-4px_rgba(16,185,129,0.45)]"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t("prop_portal.client_accounts.open_trade_room")}
        </a>
      </div>

      {/* meta row: platform + broker */}
      {(platformName || brokerName) && (
        <div className="flex flex-wrap gap-6 border-b border-portal-border bg-white/[0.02] px-5 py-3.5">
          {platformName && (
            <div>
              <p className="portal-label text-[10px] font-semibold uppercase tracking-[0.15em]">
                {t("prop_portal.client_accounts.platform_name")}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                {platformName}
              </p>
            </div>
          )}
          {brokerName && (
            <div>
              <p className="portal-label text-[10px] font-semibold uppercase tracking-[0.15em]">
                {t("prop_portal.client_accounts.broker_name")}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                {brokerName}
              </p>
            </div>
          )}
        </div>
      )}

      {/* credentials grid */}
      <div className="grid gap-px bg-portal-subtle-hover sm:grid-cols-2">
        {/* login */}
        <div className="flex items-center justify-between gap-3 bg-[rgb(23,26,35)] p-5">
          <div className="min-w-0">
            <p className="portal-label text-[10px] font-semibold uppercase tracking-[0.15em]">
              {t("prop_portal.client_accounts.platform_login")}
            </p>
            <p className="mt-1.5 truncate text-sm font-semibold text-white">
              {platformLogin}
            </p>
          </div>
          <CopyButton
            value={platformLogin}
            variant="chip"
            label={t("prop_portal.client_accounts.copy")}
            copiedLabel={t("prop_portal.client_accounts.copied")}
            className="shrink-0"
          />
        </div>

        {/* password */}
        <div className="flex items-center justify-between gap-3 bg-[rgb(23,26,35)] p-5">
          <div className="min-w-0">
            <p className="portal-label text-[10px] font-semibold uppercase tracking-[0.15em]">
              {t("prop_portal.client_accounts.platform_password")}
            </p>
            <div className="mt-1.5">
              <PasswordField
                value={platformPassword}
                showLabel={t("prop_portal.client_accounts.show_password")}
                hideLabel={t("prop_portal.client_accounts.hide_password")}
                copyable
                className="p-0 bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* trade room url */}
      {tradeRoomUrl && (
        <div className="border-t border-portal-border bg-white/[0.02] px-5 py-3.5">
          <p className="portal-label text-[10px] font-semibold uppercase tracking-[0.15em]">
            {t("prop_portal.client_accounts.trade_room_link")}
          </p>
          <p className="mt-1 truncate text-xs text-portal-secondary">
            {tradeRoomUrl}
          </p>
        </div>
      )}
    </div>
  );
}
