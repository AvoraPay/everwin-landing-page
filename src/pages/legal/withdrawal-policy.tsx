// src/pages/legal/withdrawal-policy.tsx
import { LegalPageShell } from "./LegalPageShell";
import { LegalPageBody } from "./_ui";

export default function WithdrawalPolicy() {
  return (
    <LegalPageShell
      title="Withdrawal Policy"
      updated="January 2026"
      lead="How withdrawal requests are reviewed, approved, and processed."
    >
      <LegalPageBody>
        <p>
          This policy explains how withdrawal requests may be processed and which conditions
          may apply to protect users and ensure compliance.
        </p>

        <h3>1. Verification requirements</h3>
        <p>
          We may require identity verification and additional documentation prior to
          approving withdrawals, including to prevent fraud and comply with AML obligations.
        </p>

        <h3>2. Destination and ownership</h3>
        <ul>
          <li>Withdrawals may be returned to the original funding method where applicable.</li>
          <li>Withdrawals to third parties are not permitted (accounts must be in your name).</li>
        </ul>

        <h3>3. Processing times</h3>
        <p>
          Processing times vary by payment method, provider, and compliance checks. External
          provider delays may occur and are outside Everwin’s control.
        </p>

        <h3>4. Holds, refusals, and limitations</h3>
        <p>
          We may delay, suspend, or refuse withdrawal requests in cases of suspected fraud,
          disputes, technical errors, account security concerns, or legal requirements.
        </p>

        <h3>5. Fees</h3>
        <p>
          Fees may apply depending on the withdrawal method and currency conversion. Where possible,
          applicable fees will be displayed or disclosed in the relevant flow.
        </p>

        <h3>6. Contact</h3>
        <p>
          Withdrawal support: <strong>support@everwin.trade</strong>
        </p>
      </LegalPageBody>
    </LegalPageShell>
  );
}
