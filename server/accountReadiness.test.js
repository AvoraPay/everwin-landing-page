import test from "node:test";
import assert from "node:assert/strict";

import { derivePublicSubmissionStatus, isTradingAccountProvisioned } from "./accountReadiness.js";

test("does not release a locally-created account without a broker user id", () => {
  assert.equal(
    isTradingAccountProvisioned({
      platform_user_id: null,
      platform_login: "temporary@everwin.capital",
      platform_password_enc: "encrypted-temporary-password",
    }),
    false,
  );
});

test("releases an account only after broker linkage and credentials exist", () => {
  assert.equal(
    isTradingAccountProvisioned({
      platform_user_id: "broker-user-123",
      platform_login: "trader123",
      platform_password_enc: "encrypted-platform-password",
    }),
    true,
  );
});

test("reports payment approved while the operational account is still pending", () => {
  assert.equal(
    derivePublicSubmissionStatus("account_ready", [
      { platformUserId: undefined, platformLogin: "temporary", platformPassword: "temporary" },
    ]),
    "payment_approved",
  );
});

test("reports account ready after a broker-linked account exists", () => {
  assert.equal(
    derivePublicSubmissionStatus("payment_approved", [
      { platformUserId: "broker-user-123", platformLogin: "trader123", platformPassword: "secret" },
    ]),
    "account_ready",
  );
});
