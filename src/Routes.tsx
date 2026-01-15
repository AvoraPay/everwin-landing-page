// src/Routes.tsx
import { Routes, Route } from "react-router-dom";
import { App } from "./App";

import Home from "./pages/Home";

import Privacy from "./pages/legal/privacy";
import PaymentPolicy from "./pages/legal/payment-policy";
import GeneralFees from "./pages/legal/general-fees";
import Terms from "./pages/legal/terms";
import Aml from "./pages/legal/aml";
import WithdrawalPolicy from "./pages/legal/withdrawal-policy";
import RiskDisclosure from "./pages/legal/risk-disclosure";
import OrderExecution from "./pages/legal/order-execution";
import MarginTrading from "./pages/legal/margin-trading";
import Cookies from "./pages/legal/cookies";
import DemoAccounts from "./pages/legal/demo-accounts";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Layout */}
      <Route element={<App />}>
        {/* Pages */}
        <Route path="/" element={<Home />} />

        {/* Legal */}
        <Route path="/legal/privacy" element={<Privacy />} />
        <Route path="/legal/payment-policy" element={<PaymentPolicy />} />
        <Route path="/legal/general-fees" element={<GeneralFees />} />
        <Route path="/legal/terms" element={<Terms />} />
        <Route path="/legal/aml" element={<Aml />} />
        <Route path="/legal/withdrawal-policy" element={<WithdrawalPolicy />} />
        <Route path="/legal/risk-disclosure" element={<RiskDisclosure />} />
        <Route path="/legal/order-execution" element={<OrderExecution />} />
        <Route path="/legal/margin-trading" element={<MarginTrading />} />
        <Route path="/legal/cookies" element={<Cookies />} />
        <Route path="/legal/demo-accounts" element={<DemoAccounts />} />
      </Route>
    </Routes>
  );
}
