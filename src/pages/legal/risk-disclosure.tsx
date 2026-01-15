// src/pages/legal/risk-disclosure.tsx
import { LegalPageShell } from "./LegalPageShell";
import { LegalPageBody } from "./_ui";

export default function RiskDisclosure() {
  return (
    <LegalPageShell
      title="Risk Disclosure"
      updated="January 2026"
      lead="Important risk warnings regarding trading and financial operations."
    >
      <LegalPageBody>
        <p>
          Trading and financial operations may involve substantial risk and may not be
          suitable for all individuals. You should assess your financial situation and
          consult independent advisors where appropriate.
        </p>

        <h3>1. Risk of loss</h3>
        <p>
          You may lose part or all of the funds used in connection with trading. Past performance
          does not guarantee future results.
        </p>

        <h3>2. Market volatility</h3>
        <p>
          Prices may fluctuate rapidly due to external events, liquidity conditions, and other
          factors beyond our control.
        </p>

        <h3>3. Technology and connectivity</h3>
        <p>
          Service interruptions, latency, and connectivity issues may impact access or outcomes.
          We do not guarantee uninterrupted service.
        </p>

        <h3>4. No advice</h3>
        <p>
          Unless explicitly stated, content is provided for informational purposes only and does
          not constitute legal, tax, financial, or investment advice.
        </p>
      </LegalPageBody>
    </LegalPageShell>
  );
}
