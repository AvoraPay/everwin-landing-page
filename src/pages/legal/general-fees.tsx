// src/pages/legal/general-fees.tsx
import { LegalPageShell } from "./LegalPageShell";
import { LegalPageBody } from "./_ui";

export default function GeneralFeesPolicy() {
  return (
    <LegalPageShell
      title="General Fees"
      updated="January 2026"
      lead="Overview of fees that may apply when using Everwin services."
    >
      <LegalPageBody>
        <p>
          This document provides a high-level overview of potential fees. Fees may vary by
          region, method, and product offering, and may be updated from time to time.
        </p>

        <h3>1. Payment provider fees</h3>
        <p>
          Deposits and withdrawals may incur fees charged by third-party payment providers.
          These fees are determined by the provider and may change.
        </p>

        <h3>2. Currency conversion</h3>
        <p>
          Conversion fees and exchange rate spreads may apply when transacting in a currency
          different from your account’s base currency.
        </p>

        <h3>3. Administrative fees</h3>
        <ul>
          <li>
            <strong>Inactivity:</strong> where permitted by law, an administrative fee may
            apply after a period of inactivity.
          </li>
          <li>
            <strong>Exceptional handling:</strong> manual investigations related to fraud
            or disputes may include administrative handling where permitted.
          </li>
        </ul>

        <h3>4. Transparency</h3>
        <p>
          Where possible, applicable fees will be disclosed during relevant flows or made
          available in documentation.
        </p>
      </LegalPageBody>
    </LegalPageShell>
  );
}
