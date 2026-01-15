// src/pages/legal/_ui.tsx
import type { ReactNode } from "react";

export function LegalPageBody({ children }: { children: ReactNode }) {
  return (
    <div
      className={[
        "font-bricolage_grotesque text-[15px] md:text-[16px] text-gray-700 leading-7",
        "[&>p]:mt-4",
        "[&>h2]:mt-10 [&>h2]:text-[20px] md:[&>h2]:text-[24px] [&>h2]:font-semibold [&>h2]:text-gray-900",
        "[&>h3]:mt-8 [&>h3]:text-[16px] md:[&>h3]:text-[18px] [&>h3]:font-semibold [&>h3]:text-gray-900",
        "[&>ul]:mt-4 [&>ul]:pl-5 [&>ul]:space-y-2 [&>ul]:list-disc",
        "[&>ol]:mt-4 [&>ol]:pl-5 [&>ol]:space-y-2 [&>ol]:list-decimal",
        "[&_strong]:text-gray-900",
        "[&_a]:text-emerald-600 hover:[&_a]:text-emerald-500",
        "[&>hr]:my-10 [&>hr]:border-gray-200",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
