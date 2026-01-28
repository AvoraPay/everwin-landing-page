// src/pages/legal/privacy.tsx
import { LegalPageShell } from "./LegalPageShell";
import { LegalPageBody } from "./_ui";

export default function PrivacyPolicy() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      updated="January 2026"
      lead="How Everwin collects, uses, stores, and protects personal information."
    >
      <LegalPageBody>
        <p>
          Everwin (“we”, “us”, “our”) respects your privacy and is committed to
          protecting personal information. This Privacy Policy explains what we
          collect, why we collect it, how we use it, and the choices available to you.
        </p>

        <h3>1. Scope</h3>
        <p>
          This policy applies to visitors and users of Everwin’s website and related
          services (the “Services”). If you interact with Everwin through third-party
          services, additional terms may apply.
        </p>

        <h3>2. Information we may collect</h3>
        <ul>
          <li>
            <strong>Identity & Contact:</strong> name, email address, phone number.
          </li>
          <li>
            <strong>Technical:</strong> IP address, device and browser information,
            log data, cookies and similar identifiers.
          </li>
          <li>
            <strong>Usage:</strong> pages viewed, actions performed, time spent,
            navigation paths.
          </li>
          <li>
            <strong>Support:</strong> messages, requests, and communication history.
          </li>
          <li>
            <strong>Compliance (where applicable):</strong> verification information
            (KYC) and related documents.
          </li>
        </ul>

        <h3>3. How we collect information</h3>
        <ul>
          <li>Directly from you (forms, support requests, communications).</li>
          <li>Automatically when you use the Services (cookies and similar tech).</li>
          <li>
            From service providers supporting operations (e.g., hosting, analytics).
          </li>
        </ul>

        <h3>4. Purposes of processing</h3>
        <ul>
          <li>Provide and improve the Services and user experience.</li>
          <li>Maintain security, prevent abuse, and troubleshoot issues.</li>
          <li>Comply with legal obligations and enforce policies.</li>
          <li>Respond to support requests and communicate service updates.</li>
          <li>
            With consent where required, provide marketing communications (opt-out available).
          </li>
        </ul>

        <h3>5. Legal bases (where applicable)</h3>
        <p>
          Depending on your jurisdiction, we may process information based on contract
          necessity, legal obligations, legitimate interests (e.g., security), or consent.
        </p>

        <h3>6. Sharing</h3>
        <p>
          We may share information with vetted service providers who process data on our
          behalf (e.g., hosting, security, analytics). We may also disclose information
          where required by law, to protect rights and safety, or to prevent fraud.
        </p>

        <h3>7. Retention</h3>
        <p>
          We retain personal information only for as long as necessary to achieve the
          purposes described above, including legal, regulatory, and audit requirements.
        </p>

        <h3>8. Your rights</h3>
        <p>
          Depending on your jurisdiction, you may have rights to access, correct, delete,
          restrict processing, object, or request portability. You may withdraw consent at
          any time where processing is based on consent.
        </p>

        <h3>9. Cookies</h3>
        <p>
          We use cookies and similar technologies for essential functionality and analytics.
          See our Cookies Policy for details.
        </p>

        <h3>10. Contact</h3>
        <p>
          For privacy requests, contact: <strong>support@everwin.trade</strong>
        </p>
      </LegalPageBody>
    </LegalPageShell>
  );
}
