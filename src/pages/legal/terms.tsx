// src/pages/legal/terms.tsx
import { LegalPageShell } from "./LegalPageShell";
import { LegalPageBody } from "./_ui";

export default function TermsAndConditions() {
  return (
    <LegalPageShell
      title="Terms & Conditions"
      updated="January 2026"
      lead="General terms governing access to and use of Everwin’s website and services."
    >
      <LegalPageBody>
        <p>
          These Terms govern your access to and use of Everwin’s website and related
          services (the “Services”). By accessing or using the Services, you agree to
          these Terms.
        </p>

        <h3>1. Eligibility and access</h3>
        <ul>
          <li>You must comply with applicable laws and regulations.</li>
          <li>We may restrict access to certain jurisdictions.</li>
          <li>We may suspend or terminate access to protect users and the platform.</li>
        </ul>

        <h3>2. Use of the Services</h3>
        <ul>
          <li>Do not misuse the Services (fraud, abuse, interference, or illegal use).</li>
          <li>You are responsible for maintaining account security (where applicable).</li>
          <li>You must provide accurate information when requested.</li>
        </ul>

        <h3>3. No advice</h3>
        <p>
          Unless explicitly stated, information provided on the website is for general
          informational purposes and does not constitute financial, legal, tax, or
          investment advice.
        </p>

        <h3>4. Intellectual property</h3>
        <p>
          The Services, including software, design, and content, are owned by Everwin or
          its licensors and are protected by applicable laws. You may not copy, modify,
          distribute, or create derivative works without written permission.
        </p>

        <h3>5. Disclaimers</h3>
        <p>
          The Services are provided “as is” and “as available”. We do not guarantee that
          the Services will be uninterrupted, error-free, or secure.
        </p>

        <h3>6. Limitation of liability</h3>
        <p>
          To the maximum extent permitted by law, Everwin will not be liable for indirect,
          incidental, special, consequential, or punitive damages arising from use of the
          Services.
        </p>

        <h3>7. Changes</h3>
        <p>
          We may update these Terms from time to time. Continued use of the Services after
          updates indicates acceptance of the revised Terms.
        </p>

        <h3>8. Contact</h3>
        <p>
          For questions, contact: <strong>support@everwin.capital</strong>
        </p>
      </LegalPageBody>
    </LegalPageShell>
  );
}
