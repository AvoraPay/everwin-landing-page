// src/sections/DepositWithdrawalSection/DepositWithdrawalSection.tsx
import { DepositWithdrawalContent } from "./components/DepositWithdrawalContent";
import { DepositWithdrawalVisual } from "./components/DepositWithdrawalVisual";

export const DepositWithdrawalSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#F6F7F8] py-20 md:py-24">
      <div className="mx-auto  px-4">
        <DepositWithdrawalContent />

        <div className="mt-12 flex justify-center md:mt-14">
          <DepositWithdrawalVisual />
        </div>
      </div>
    </section>
  );
};
