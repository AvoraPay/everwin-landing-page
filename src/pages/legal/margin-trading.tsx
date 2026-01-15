// src/pages/legal/margin-trading.tsx
import { LegalPageShell } from "./LegalPageShell";
import { LegalPageBody } from "./_ui";

export default function MarginTradingPolicy() {
  return (
    <LegalPageShell
      title="Margin Trading"
      updated="January 2026"
      lead="Key risk information for leveraged and margin-based products (where available)."
    >
      <LegalPageBody>
        <p>
          Margin trading and leveraged products can amplify both gains and losses. They may
          increase the likelihood of significant losses and liquidation under volatile conditions.
        </p>

        <h3>1. Leverage risk</h3>
        <p>
          Leverage may result in rapid losses and may exceed initial exposure depending on product
          terms and conditions.
        </p>

        <h3>2. Liquidation</h3>
        <p>
          Positions may be liquidated automatically when margin requirements are not met. Liquidations
          may occur during fast markets and adverse price movements.
        </p>

        <h3>3. Availability</h3>
        <p>
          We do not guarantee availability, pricing, or uninterrupted access during periods of high
          volatility, outages, or provider limitations.
        </p>
      </LegalPageBody>
    </LegalPageShell>
  );
}
