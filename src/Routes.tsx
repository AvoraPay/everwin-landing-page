// src/Routes.tsx
import { Component, type ReactNode } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
          <div className="max-w-lg rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-700">Something went wrong</h2>
            <p className="mt-2 text-sm text-red-600">{this.state.error.message}</p>
            <pre className="mt-3 max-h-40 overflow-auto rounded bg-red-100 p-3 text-xs text-red-800">{this.state.error.stack}</pre>
            <button type="button" onClick={() => this.setState({ error: null })} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500">
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import { App } from "./App";

import Home from "./pages/Home";
import Affiliate from "./pages/affiliate";
import AffiliateOnboardingPage from "./pages/affiliate/onboarding";
import PropPage from "./pages/PropPage";
import PropCheckout from "./pages/PropCheckout";
import PropSubmissionStatusPage from "./pages/PropSubmissionStatusPage";
import PropThankYouPage from "./pages/PropThankYouPage";

import { LegalLayout } from "./pages/legal/LegalLayout";
import { LegalStructuredPage } from "./pages/legal/LegalStructuredPage";
import PropTradingTerms from "./pages/legal/prop-trading-terms";
import { PropSystemProvider } from "./modules/prop-system/context";
import { RequireAuth, RequireRole } from "./modules/prop-system/guards";
import { PropPortalLayout } from "./modules/prop-system/layout/PropPortalLayout";
import { ThemeProvider } from "./modules/prop-system/theme";
import { PropPageLayout } from "./modules/prop-system/layout/PropPageLayout";
import { PropLoginPage } from "./modules/prop-system/pages/PropLoginPage";
import { AdminDashboardPage } from "./modules/prop-system/pages/admin/AdminDashboardPage";
import { AdminAnalyticsPage } from "./modules/prop-system/pages/admin/AdminAnalyticsPage";
import { AdminAccountsPage } from "./modules/prop-system/pages/admin/AdminAccountsPage";
import { AdminSettingsPage } from "./modules/prop-system/pages/admin/AdminSettingsPage";
import { AdminSubmissionsPage } from "./modules/prop-system/pages/admin/AdminSubmissionsPage";
import { AdminUsersPage } from "./modules/prop-system/pages/admin/AdminUsersPage";
import { ClientDashboardPage } from "./modules/prop-system/pages/client/ClientDashboardPage";
import { ClientAccountsPage } from "./modules/prop-system/pages/client/ClientAccountsPage";
import { ClientProfilePage } from "./modules/prop-system/pages/client/ClientProfilePage";
import { ClientSubmissionsPage } from "./modules/prop-system/pages/client/ClientSubmissionsPage";
import { PropNotFoundPage } from "./modules/prop-system/pages/PropNotFoundPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/affiliate/onboarding" element={<AffiliateOnboardingPage />} />

      {/* Prop System - tudo sobre prop fica aqui */}
      <Route
        path="/prop/*"
        element={
          <PropSystemProvider>
            <Outlet />
          </PropSystemProvider>
        }
      >
        {/* Landing pages com Navbar e Footer */}
        <Route element={<PropPageLayout />}>
          <Route index element={<PropPage />} />
          <Route path="checkout" element={<PropCheckout />} />
          <Route path="submission" element={<PropSubmissionStatusPage />} />
          <Route path="thank-you" element={<PropThankYouPage />} />
          {/* reset-password removed — no OTP flow */}
          {/* Backup routes for old URLs - /prop/landing/* redirects to /prop/* */}
          <Route path="landing" element={<Navigate to="/prop" replace />} />
          <Route path="landing/checkout" element={<Navigate to="/prop/checkout" replace />} />
          <Route path="landing/submission" element={<Navigate to="/prop/submission" replace />} />
          <Route path="landing/thank-you" element={<Navigate to="/prop/thank-you" replace />} />
          {/* landing/reset-password redirect removed */}
        </Route>

        {/* Portal */}
        <Route path="login" element={<PropLoginPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<ThemeProvider><ErrorBoundary><PropPortalLayout /></ErrorBoundary></ThemeProvider>}>
            <Route element={<RequireRole role="admin" />}>
              <Route path="admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="admin/users" element={<AdminUsersPage />} />
              <Route path="admin/submissions" element={<AdminSubmissionsPage />} />
              <Route path="admin/accounts" element={<AdminAccountsPage />} />
              <Route path="admin/analytics" element={<AdminAnalyticsPage />} />
              <Route path="admin/settings" element={<AdminSettingsPage />} />
            </Route>

            <Route element={<RequireRole role="client" />}>
              <Route path="client/dashboard" element={<ClientDashboardPage />} />
              <Route path="client/accounts" element={<ClientAccountsPage />} />
              <Route path="client/profile" element={<ClientProfilePage />} />
              <Route path="client/submissions" element={<ClientSubmissionsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<PropNotFoundPage />} />
      </Route>

      {/* Layout com Header/Footer */}
      <Route element={<App />}>
        {/* Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/affiliate" element={<Affiliate />} />
        <Route path="/legal" element={<LegalLayout />}>
          <Route index element={<Navigate to="privacy" replace />} />
          <Route path="privacy" element={<LegalStructuredPage slug="privacy" />} />
          <Route path="terms" element={<LegalStructuredPage slug="terms" />} />
          <Route path="prop-trading-terms" element={<PropTradingTerms />} />
          <Route path="prop-evaluation-policy" element={<LegalStructuredPage slug="prop-evaluation-policy" />} />
          <Route path="prop-plans-fees" element={<LegalStructuredPage slug="prop-plans-fees" />} />
          <Route path="prop-account-access" element={<LegalStructuredPage slug="prop-account-access" />} />
          <Route path="prop-account-access-policy" element={<LegalStructuredPage slug="prop-account-access-policy" />} />
          <Route path="prop-payout-policy" element={<LegalStructuredPage slug="prop-payout-policy" />} />
          <Route
            path="prop-purchase-reset-policy"
            element={<LegalStructuredPage slug="prop-purchase-reset-policy" />}
          />
          <Route path="prop-trading-restrictions" element={<LegalStructuredPage slug="prop-trading-restrictions" />} />
          <Route path="cookies" element={<LegalStructuredPage slug="cookies" />} />
          <Route path="payment-policy" element={<LegalStructuredPage slug="payment-policy" />} />
          <Route path="withdrawal-policy" element={<LegalStructuredPage slug="withdrawal-policy" />} />
          <Route path="general-fees" element={<LegalStructuredPage slug="general-fees" />} />
          <Route path="risk-disclosure" element={<LegalStructuredPage slug="risk-disclosure" />} />
          <Route path="order-execution" element={<LegalStructuredPage slug="order-execution" />} />
          <Route path="margin-trading" element={<LegalStructuredPage slug="margin-trading" />} />
          <Route path="aml" element={<LegalStructuredPage slug="aml" />} />
          <Route path="demo-accounts" element={<LegalStructuredPage slug="demo-accounts" />} />
          <Route path="account-closure" element={<LegalStructuredPage slug="account-closure" />} />
        </Route>
      </Route>
    </Routes>
  );
}
