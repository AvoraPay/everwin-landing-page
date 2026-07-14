// src/sections/DepositWithdrawalSection/components/DepositForm.tsx
import React from "react";

type Props = { className?: string };

export const DepositForm: React.FC<Props> = ({ className }) => {
  return (
    <div
      className={[
        "w-[340px] sm:w-[380px]",
        "rounded-[22px]",
        "bg-gray-900/90 backdrop-blur-[10px]",
        "border border-gray-800/50",
        "shadow-[0_28px_90px_rgba(0,0,0,0.28)]",
        "p-6",
        className ?? "",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-2">
        <img
          src="https://c.animaapp.com/mk284v6uqUa07j/assets/icon-16.svg"
          alt=""
          className="h-5 w-5 opacity-90"
        />
        <p className="text-neutral-100/60 text-[12px] leading-none text-center font-bricolage_grotesque">
          Safe method
        </p>
      </div>

      {/* Value */}
      <div className="mt-6">
        <p className="text-neutral-100/60 text-[12px] font-bricolage_grotesque">
          Enter the Value:
        </p>

        <div className="mt-3 rounded-[10px] bg-gray-900/40 border border-gray-800/60 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-neutral-100 text-[26px] leading-none font-bricolage_grotesque">
              $60
            </span>
            <span className="h-6 w-[2px] bg-emerald-400/80 rounded-full" />
          </div>
        </div>

        {/* Quick values */}
        <div className="mt-4 rounded-[10px] bg-gray-900/30 border border-gray-800/60 p-2">
          <div className="grid grid-cols-3 gap-2">
            <button className="h-[46px] rounded-[10px] bg-gray-800/70 border border-gray-700/40 flex items-center justify-center gap-2">
              <span className="text-neutral-100 text-[14px] font-bricolage_grotesque">
                $60
              </span>
            </button>

            {["$100", "$250", "$500", "$750", "$1000"].map((v) => (
              <button
                key={v}
                className="h-[46px] rounded-[10px] bg-gray-800/40 border border-gray-700/30 flex items-center justify-center opacity-60"
              >
                <span className="text-neutral-100 text-[14px] font-bricolage_grotesque">
                  {v}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Promo */}
      <div className="mt-6">
        <p className="text-neutral-100/60 text-[12px] font-bricolage_grotesque">
          Promotional Code
        </p>
        <p className="mt-2 text-neutral-100/50 text-[12px] font-bricolage_grotesque">
          *Use a promotional code per deposit
        </p>

        <div className="mt-4 flex gap-3">
          <div className="flex-1 h-[46px] rounded-[10px] bg-gray-900/40 border border-gray-800/60 px-4 flex items-center">
            <span className="text-neutral-100/25 text-[12px] font-bricolage_grotesque">
              Select code
            </span>
          </div>
          <button className="w-[130px] h-[46px] rounded-[10px] bg-gray-800/70 border border-black/10 text-neutral-100/25 text-[13px] font-bricolage_grotesque">
            Apply
          </button>
        </div>

        <button className="mt-4 text-emerald-400 text-[12px] font-bricolage_grotesque">
          Show available (4)
        </button>
      </div>

      {/* Extra fields (ficam “cortados” igual print2 quando a posição está correta) */}
      <div className="mt-6 space-y-4">
        <div>
          <p className="text-neutral-100/60 text-[12px] font-bricolage_grotesque">
            Name (Dollar)
          </p>
          <div className="mt-2 h-[46px] rounded-[10px] bg-gray-900/40 border border-gray-800/60 px-4 flex items-center">
            <span className="text-neutral-100/25 text-[12px] font-bricolage_grotesque">
              Select the code
            </span>
          </div>
        </div>

        <div>
          <p className="text-neutral-100/60 text-[12px] font-bricolage_grotesque">
            CPF
          </p>
          <div className="mt-2 h-[46px] rounded-[10px] bg-gray-900/40 border border-gray-800/60 px-4 flex items-center">
            <span className="text-neutral-100/25 text-[12px] font-bricolage_grotesque">
              XXX.XXX.XXX-XX
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-[18px] w-[18px] rounded-[6px] bg-gray-900/70 border border-gray-800/60" />
          <p className="text-[13px] font-bricolage_grotesque">
            <span className="text-neutral-100">Aceito os </span>
            <span className="text-emerald-400">termos e condições</span>
          </p>
        </div>
      </div>

      {/* CTA */}
      <button className="mt-6 w-full h-[46px] rounded-[12px] bg-emerald-500 text-white font-bricolage_grotesque shadow-[0_0_80px_rgba(28,199,142,0.22)]">
        Depositar R$60
      </button>
    </div>
  );
};
