// src/pages/legal/cookies.tsx
import { LegalPageShell } from "./LegalPageShell";
import { LegalPageBody } from "./_ui";

export default function CookiesPolicy() {
  return (
    <LegalPageShell
      title="Cookies Policy"
      updated="January 2026"
      lead="How cookies and similar technologies are used on Everwin."
    >
      <LegalPageBody>
        <p>
          Cookies are small text files stored on your device. We use cookies and similar
          technologies to provide core functionality, improve performance, and understand
          usage patterns.
        </p>

        <h3>1. Types of cookies</h3>
        <ul>
          <li>
            <strong>Essential cookies:</strong> required to operate the website and enable
            key features.
          </li>
          <li>
            <strong>Analytics cookies:</strong> help us measure traffic and improve the
            experience.
          </li>
          <li>
            <strong>Preference cookies:</strong> remember settings such as language or
            region (where applicable).
          </li>
        </ul>

        <h3>2. Managing cookies</h3>
        <p>
          You can control cookies through your browser settings. Disabling some cookies
          may impact website functionality.
        </p>

        <h3>3. Third-party providers</h3>
        <p>
          Some analytics or embedded tools may set their own cookies. We use reputable
          providers and aim to minimize data collection.
        </p>

        <h3>4. Contact</h3>
        <p>
          Questions about cookies: <strong>support@everwin.capital</strong>
        </p>
      </LegalPageBody>
    </LegalPageShell>
  );
}
