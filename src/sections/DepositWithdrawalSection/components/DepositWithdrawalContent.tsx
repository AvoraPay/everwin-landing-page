// src/sections/DepositWithdrawalSection/components/DepositWithdrawalContent.tsx
import { Reveal } from "../../../components/Reveal";

export const DepositWithdrawalContent = () => {
  return (
    <div className="relative z-10 flex w-full flex-col items-center text-center">
      <Reveal>
        <div className="flex h-[84px] w-[84px] items-center justify-center">
          <img
            src="https://c.animaapp.com/mk284v6uqUa07j/assets/icon-13.svg"
            alt="Icon"
            className="h-[84px] w-[84px]"
          />
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-6 w-full">
          <p className="font-bricolage_grotesque text-[38px] leading-[1.05] text-gray-800 md:text-[62px]">
            Fast deposit,
          </p>
          <p className="font-bricolage_grotesque text-[38px] leading-[1.05] text-gray-800 md:text-[62px]">
            Even faster withdrawal!
          </p>
        </div>
      </Reveal>

      <Reveal delay={140}>
        <p className="mt-5 max-w-[526px] font-bricolage_grotesque text-base leading-6 text-gray-500">
          Your deposit on the platform is immediate, and after making a profit,
          you can withdraw everything instantly!
        </p>
      </Reveal>
    </div>
  );
};
