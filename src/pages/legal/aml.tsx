// src/pages/legal/aml.tsx
import { LegalPageShell } from "./LegalPageShell";
import { LegalPageBody } from "./_ui";

export default function AMLKYCPolicy() {
  return (
    <LegalPageShell
      title="AML & KYC Policy"
      updated="January 2026"
      lead="Everwin’s approach to preventing money laundering, terrorist financing, and fraud."
    >
      <LegalPageBody>
        <p>
          Everwin maintains procedures designed to prevent money laundering, terrorist financing,
          and fraud, consistent with applicable legal and compliance expectations.
        </p>

        <h3>1. Customer identification (KYC)</h3>
        <p>
          We may request identity documentation and additional information to verify your identity
          and assess risk. Failure to provide required information may restrict access to features.
        </p>

        <h3>2. Monitoring and controls</h3>
        <p>
          We may monitor activity for suspicious patterns. We may request additional information
          related to source of funds, ownership, or transaction purpose.
        </p>

        <h3>3. Restrictions</h3>
        <p>
          We may restrict access based on jurisdictional limitations, sanctions programs, and high-risk
          lists, where applicable.
        </p>

        <h3>4. Reporting and cooperation</h3>
        <p>
          We may cooperate with lawful requests and report suspicious activity where required.
        </p>

        <h3>5. Record retention</h3>
        <p>
          We may retain AML/KYC records for periods required by law and for legitimate operational needs.
        </p>
      </LegalPageBody>
    </LegalPageShell>
  );
}
