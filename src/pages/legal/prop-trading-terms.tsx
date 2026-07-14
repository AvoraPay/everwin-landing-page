import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { LegalPageShell } from "./LegalPageShell";
import { LegalPageBody } from "./_ui";

type TermItem = string | { label: string; text: string };
type TermSection = {
  title: string;
  items?: TermItem[];
  paragraphs?: string[];
};

type PropTermsContent = {
  title: string;
  updated: string;
  lead: string;
  intro: string[];
  sections: TermSection[];
};

export default function PropTradingTerms() {
  const { t } = useTranslation();
  const content = t("prop_legal.prop_trading_terms", { returnObjects: true }) as PropTermsContent;

  return (
    <LegalPageShell title={content.title} updated={content.updated} lead={content.lead}>
      <LegalPageBody>
        {content.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}

        {content.sections.map((section) => (
          <Fragment key={section.title}>
            <h3>{section.title}</h3>

            {section.items ? (
              <ul>
                {section.items.map((item, index) => (
                  <li key={`${section.title}-${index}`}>
                    {typeof item === "string" ? (
                      item
                    ) : (
                      <>
                        <strong>{item.label}:</strong> {item.text}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}

            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Fragment>
        ))}
      </LegalPageBody>
    </LegalPageShell>
  );
}
