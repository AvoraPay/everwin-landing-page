// src/pages/legal/demo-accounts.tsx
import { LegalPageShell } from "./LegalPageShell";
import { LegalPageBody } from "./_ui";

export default function DemoAccountsPolicy() {
  return (
    <LegalPageShell
      title="Demo Accounts"
      updated="January 2026"
      lead="Important information about demo environments and simulated trading."
    >
      <LegalPageBody>
        <p>
          Demo accounts (where available) are designed for educational and testing purposes.
          Demo conditions may differ from real environments in pricing, execution, and availability.
        </p>

        <h3>1. No real-world equivalence</h3>
        <p>
          Demo outcomes do not reflect real-world results. Live markets involve liquidity,
          slippage, fees, and latency.
        </p>

        <h3>2. Limitations and resets</h3>
        <p>
          We may limit demo access, reset balances, or discontinue demo features at any time.
        </p>

        <h3>3. No guarantee</h3>
        <p>
          We do not guarantee uninterrupted demo availability or that demo features reflect
          current live conditions.
        </p>
      </LegalPageBody>
    </LegalPageShell>
  );
}
