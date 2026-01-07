// src/sections/DepositWithdrawalSection/components/DepositWithdrawalVisual.tsx
import React, { useEffect, useRef, useState } from "react";
import { Parallax, HERO_PARALLAX } from "../../../components/Parallax";
import { DepositForm } from "./DepositForm";
import { WithdrawalForm } from "./WithdrawalForm";

const IphoneMock: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={[
        "relative",
        "w-[280px] h-[380px]",
        "sm:w-[320px] sm:h-[430px]",
        "md:w-[420px] md:h-[540px]",
        className ?? "",
      ].join(" ")}
    >
      {/* outer body */}
      <div className="absolute inset-0 rounded-[58px] bg-[#bfc1c8] shadow-[0_40px_120px_rgba(0,0,0,0.16)]" />
      {/* inner screen */}
      <div className="absolute inset-[10px] rounded-[50px] bg-[#1d232c]" />
      {/* notch body */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[190px] h-[44px] md:w-[220px] md:h-[52px] bg-[#bfc1c8] rounded-b-[28px]" />
      {/* notch detail */}
      <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[92px] h-[12px] bg-[#1d232c] rounded-full opacity-70" />
      {/* subtle highlight */}
      <div className="absolute inset-[10px] rounded-[50px] bg-[radial-gradient(120%_80%_at_50%_20%,rgba(255,255,255,0.08),transparent_55%)]" />
    </div>
  );
};

export const DepositWithdrawalVisual: React.FC = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const baseAnim = show
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-10";

  return (
    <div
      ref={ref}
      className={[
        "relative",
        "mx-auto",
        "w-full",
        "h-[560px] md:h-[620px]",
        "overflow-hidden",
      ].join(" ")}
    >
      {/* Soft floor shadow */}
      <div className="absolute inset-x-0 bottom-[-220px] h-[520px] bg-[radial-gradient(closest-side,rgba(0,0,0,0.12),transparent)] blur-2xl" />

      {/* Background line chart */}
      <Parallax
        config={{ ...HERO_PARALLAX, y: [-10, 10] }}
        className="absolute inset-0 pointer-events-none"
      >
        <svg
          viewBox="0 0 1100 650"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 430
               C 120 410, 170 500, 270 470
               S 430 360, 520 395
               S 690 330, 780 360
               S 910 300, 1100 330"
            fill="none"
            stroke="rgba(16,185,129,0.28)"
            strokeWidth="3"
          />
          <path
            d="M0 430
               C 120 410, 170 500, 270 470
               S 430 360, 520 395
               S 690 330, 780 360
               S 910 300, 1100 330
               L1100 650 L0 650 Z"
            fill="rgba(16,185,129,0.04)"
          />
        </svg>
      </Parallax>

      {/* PHONE (center) */}
      <Parallax
        config={{ ...HERO_PARALLAX, y: [-14, 14] }}
        className={[
          "absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2",
          "transition-all duration-700 ease-out",
          baseAnim,
          "delay-150",
        ].join(" ")}
      >
        <IphoneMock />
      </Parallax>

      {/* DEPOSIT (left / cropped bottom) */}
      <div
        className={[
          "absolute z-[10]",
          // mobile: centraliza e reduz um pouco
          "left-1/2 -translate-x-1/2 bottom-[-250px] scale-[0.82]",
          // desktop: vai pra esquerda e cresce
          "md:left-1/2 md:-translate-x-[118%] md:bottom-[-300px] md:scale-100",
          "transition-all duration-700 ease-out",
          baseAnim,
          "delay-200",
        ].join(" ")}
      >
        <DepositForm />
      </div>

      {/* WITHDRAW (right) */}
      <div
        className={[
          "absolute z-[20]",
          // mobile: fica acima do deposit, centralizado
          "left-1/2 -translate-x-1/2 top-[72%] -translate-y-1/2 scale-[0.92]",
          // desktop: vai pra direita igual print2
          "md:left-1/2 md:translate-x-[20%] md:top-[64%] md:scale-100",
          "transition-all duration-700 ease-out",
          baseAnim,
          "delay-300",
        ].join(" ")}
      >
        <WithdrawalForm />
      </div>
    </div>
  );
};
