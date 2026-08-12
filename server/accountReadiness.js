/**
 * A local account row is not proof that the broker account exists. Operational
 * access is ready only after the broker returned a stable user id and the
 * credentials that will actually be delivered to the trader were persisted.
 */
export function isTradingAccountProvisioned(account) {
  return Boolean(
    (account?.platform_user_id ?? account?.platformUserId) &&
      (account?.platform_login ?? account?.platformLogin) &&
      (account?.platform_password_enc ?? account?.platformPassword),
  );
}

export function derivePublicSubmissionStatus(storedStatus, accounts = []) {
  const operationalAccessReady = accounts.some(isTradingAccountProvisioned);
  if (operationalAccessReady) return "account_ready";
  if (storedStatus === "account_ready" || storedStatus === "access_ready") return "payment_approved";
  return storedStatus;
}
