// src/pages/legal/payment-policy.tsx
import { LegalPageShell } from "./LegalPageShell";
import { LegalPageBody } from "./_ui";

export default function PaymentPolicy() {
  return (
    <LegalPageShell
      title="Payment Policy"
      updated="January 2026"
      lead="General rules and processing conditions for deposits and payments."
    >
      <LegalPageBody>
        <p>
          This policy describes how payments and deposits may be initiated and processed
          in connection with the Services. Availability of methods may vary by region.
        </p>

        <h3>1. Supported payment methods</h3>
        <p>
          Only the payment methods displayed on the official Everwin website or platform
          interface are supported. Payment options may change without notice.
        </p>

        <h3>2. Deposits</h3>
        <ul>
          <li>Deposits are initiated through the platform interface (where available).</li>
          <li>Processing time depends on the method, provider, and verification status.</li>
          <li>
            We may request additional information to verify identity or source of funds
            in accordance with compliance requirements.
          </li>
        </ul>

        <h3>3. Fees and conversion</h3>
        <p>
          Third-party providers may charge processing fees. Currency conversion may apply
          depending on the method used and your account currency.
        </p>

        <h3>4. Fraud prevention</h3>
        <p>
          We may temporarily suspend processing where we detect suspicious activity, invalid
          instruments, or risk indicators.
        </p>

        <h3>5. Disputes and chargebacks</h3>
        <p>
          If a chargeback or dispute is initiated, we may place holds on related processing
          while the dispute is resolved.
        </p>

        <h3>6. Contact</h3>
        <p>
          Payment questions: <strong>support@everwin.capital</strong>
        </p>
      </LegalPageBody>
    </LegalPageShell>
  );
}
