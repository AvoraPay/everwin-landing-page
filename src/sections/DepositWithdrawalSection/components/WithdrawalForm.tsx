// src/sections/DepositWithdrawalSection/components/WithdrawalForm.tsx
import React from "react";

type Props = { className?: string };

export const WithdrawalForm: React.FC<Props> = ({ className }) => {
  return (
    <div
      className={[
        "w-[320px] sm:w-[340px]",
        "rounded-[18px]",
        "bg-gray-900/90 backdrop-blur-[10px]",
        "border border-gray-800/50",
        "shadow-[0_24px_80px_rgba(0,0,0,0.26)]",
        "p-5",
        className ?? "",
      ].join(" ")}
    >
      {/* Available */}
      <div className="flex items-center justify-between">
        <p className="text-neutral-100/60 text-[12px] font-bricolage_grotesque">
          Available balance:
        </p>
        <div className="flex items-center gap-2">
          <span className="text-neutral-100 text-[12px] font-bricolage_grotesque">
            $ 58.345,00
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="mt-3">
        <p className="text-neutral-100/55 text-[13px] font-bricolage_grotesque">
          How much will you withdraw?
        </p>
      </div>

      {/* Amount */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-neutral-100 text-[28px] leading-none font-bricolage_grotesque">
          $ 5.000,00
        </span>
        <span className="h-6 w-[2px] bg-emerald-400/80 rounded-full" />
      </div>

      {/* Bottom box */}
      <div className="mt-4 rounded-[12px] bg-gray-900/40 border border-gray-800/60 p-3 flex items-center gap-3">
        <div className="flex-1 rounded-[10px] bg-gray-900/40 border border-gray-800/60 px-3 py-2">
          <p className="text-neutral-100/55 text-[10px] font-bricolage_grotesque">
            Final Balance:
          </p>
          <p className="mt-1 text-neutral-100 text-[13px] font-bricolage_grotesque">
            $ 53.345
          </p>
        </div>

        <button className="h-[42px] px-6 rounded-[10px] bg-emerald-500 text-gray-900 font-bricolage_grotesque shadow-[0_0_70px_rgba(28,199,142,0.20)]">
          Withdraw
        </button>
      </div>
    </div>
  );
};
