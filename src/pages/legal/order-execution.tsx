// src/pages/legal/order-execution.tsx
import { LegalPageShell } from "./LegalPageShell";
import { LegalPageBody } from "./_ui";

export default function OrderExecutionPolicy() {
  return (
    <LegalPageShell
      title="Order Execution Policy"
      updated="January 2026"
      lead="How orders and requests may be processed and executed through the Services."
    >
      <LegalPageBody>
        <p>
          This policy describes general principles and conditions that may apply to order
          processing and execution (where applicable).
        </p>

        <h3>1. Execution approach</h3>
        <ul>
          <li>We aim to process orders fairly and consistently.</li>
          <li>Execution may be affected by volatility, liquidity, and technical constraints.</li>
        </ul>

        <h3>2. Indicative pricing</h3>
        <p>
          Displayed prices and charts may be indicative and can differ from executed prices due
          to latency, provider conditions, and market movements.
        </p>

        <h3>3. Rejections, cancellations, and corrections</h3>
        <p>
          We may refuse, cancel, or reverse processing in cases of suspected fraud, technical errors,
          compliance concerns, platform integrity protection, or legal requirements.
        </p>

        <h3>4. Recordkeeping</h3>
        <p>
          We may maintain logs for security, compliance, audit, and dispute resolution.
        </p>
      </LegalPageBody>
    </LegalPageShell>
  );
}
