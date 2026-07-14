import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { normalizeAppLanguage } from "../../lib/language";
import { LegalPageShell } from "./LegalPageShell";
import { LegalPageBody } from "./_ui";
import { getLegalPolicyContent, type LegalInlineItem, type LegalPageSlug } from "./legalContent";

function LegalList({
  items,
  ordered = false,
}: {
  items: LegalInlineItem[];
  ordered?: boolean;
}) {
  const Tag = ordered ? "ol" : "ul";

  return (
    <Tag>
      {items.map((item, index) => (
        <li key={`${typeof item === "string" ? item : item.label}-${index}`}>
          {typeof item === "string" ? (
            item
          ) : (
            <>
              <strong>{item.label}:</strong> {item.text}
            </>
          )}
        </li>
      ))}
    </Tag>
  );
}

export function LegalStructuredPage({ slug }: { slug: LegalPageSlug }) {
  const { i18n } = useTranslation();
  const content = getLegalPolicyContent(normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language), slug);

  return (
    <LegalPageShell title={content.title} updated={content.updated} lead={content.lead}>
      <LegalPageBody>
        {content.intro?.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}

        {content.sections.map((section) => (
          <Fragment key={section.title}>
            <h3>{section.title}</h3>

            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            {section.items?.length ? <LegalList items={section.items} ordered={section.ordered} /> : null}

            {section.table ? (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200">
                <table className="min-w-full border-collapse bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      {section.table.columns.map((column) => (
                        <th
                          key={column}
                          className="border-b border-gray-200 px-4 py-3 text-left font-bricolage_grotesque text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row, rowIndex) => (
                      <tr key={`${section.title}-row-${rowIndex}`} className="border-b border-gray-100 last:border-b-0">
                        {row.map((cell, cellIndex) => (
                          <td
                            key={`${section.title}-row-${rowIndex}-cell-${cellIndex}`}
                            className="px-4 py-3 align-top font-bricolage_grotesque text-sm text-gray-700"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {section.note ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 font-bricolage_grotesque text-sm leading-6 text-emerald-900">
                {section.note}
              </div>
            ) : null}
          </Fragment>
        ))}
      </LegalPageBody>
    </LegalPageShell>
  );
}
