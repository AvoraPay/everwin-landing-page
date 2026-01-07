//
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "everwin_disclaimer_accepted_v1";

export const DisclaimerBanner = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(STORAGE_KEY) === "1";
      setOpen(!accepted);
    } catch {
      setOpen(true);
    }
  }, []);

  const close = () => setOpen(false);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed z-50 left-1/2 -translate-x-1/2 bottom-4 md:left-auto md:right-5 md:bottom-6 md:translate-x-0 w-[calc(100%-2rem)] md:w-auto">
      <div className="relative flex flex-col gap-4 backdrop-blur-[5px] bg-gray-900/60 border border-white/10 text-neutral-100 p-5 md:p-6 rounded-lg shadow-lg max-w-[520px]">
        {/* Close */}
        <button
          type="button"
          onClick={close}
          aria-label="Fechar aviso"
          className="absolute right-3 top-3 text-slate-50/60 hover:text-slate-50 transition"
        >
          <span className="text-[22px] leading-none font-sora">×</span>
        </button>

        {/* Text */}
        <p className="text-[13px] leading-[19.5px] font-sora pr-8">
          Everwin is not authorized by the Brazilian Securities and Exchange
          Commission to publicly offer or broker securities in Brazil. By
          accessing the Everwin website, the user declares to be aware of and
          agree to the restrictions indicated here. For more information, please
          consult the Customer Agreement.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={close}
            className="w-full sm:w-auto px-4 py-2 rounded-md border border-white/15 text-slate-50/80 hover:text-slate-50 hover:border-white/25 transition font-sora text-sm"
          >
            Close
          </button>

          <button
            type="button"
            onClick={accept}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-white text-gray-900 hover:bg-white/90 transition font-sora text-sm"
          >
            Agree
          </button>
        </div>
      </div>
    </div>
  );
};
