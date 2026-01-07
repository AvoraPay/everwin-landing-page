// everwin-page/src/sections/Footer/components/FooterContent.tsx
export const FooterContent = () => {
  return (
    <div className="mx-auto w-[90%] max-w-[1060px] flex flex-col gap-10 md:flex-row md:gap-10">
      {/* Brand */}
      <div className="flex flex-col gap-4 md:w-[320px]">
        <div className="h-[37px] w-[131px]">
          <img
            src="https://i.postimg.cc/RFLkLvK0/everwin-logo.png"
            alt="Everwin"
            className="h-full w-full object-contain"
            draggable={false}
          />
        </div>

        <p className="font-bricolage_grotesque text-base leading-[22px] text-white">
          One brokerage firm,{" "}
          <span className="text-emerald-500">countless investment opportunities.</span>
        </p>
      </div>

      {/* Columns */}
      <div className="flex flex-col gap-10 md:flex-row md:flex-1 md:justify-between">
        {/* Company */}
        <div className="flex flex-col gap-4">
          <p className="text-white text-lg font-semibold font-bricolage_grotesque">
            Company
          </p>

          <div className="flex flex-col gap-2">
            {["Start", "Assets", "Agility", "Tools"].map((x) => (
              <a
                key={x}
                href="#"
                className="text-gray-400 hover:text-white transition font-bricolage_grotesque"
              >
                {x}
              </a>
            ))}

            <a
              href="https://everwintrade.com/affiliate"
              className="text-emerald-500 hover:text-emerald-400 transition font-bricolage_grotesque"
            >
              Be a partner
            </a>
          </div>
        </div>

        {/* Policies */}
        <div className="flex flex-col gap-4">
          <p className="text-white text-lg font-semibold font-bricolage_grotesque">
            Policies
          </p>

          <div className="flex flex-col gap-2">
            <a
              href="https://everwintrade.com/legal/privacy"
              className="text-gray-400 hover:text-white transition font-bricolage_grotesque"
            >
              Privacy
            </a>
            <a
              href="https://everwintrade.com/legal/payment-policy"
              className="text-gray-400 hover:text-white transition font-bricolage_grotesque"
            >
              Payment
            </a>
            <a
              href="https://everwintrade.com/legal/general-fees"
              className="text-gray-400 hover:text-white transition font-bricolage_grotesque"
            >
              General Fees
            </a>
            <a
              href="https://everwintrade.com/legal/terms"
              className="text-gray-400 hover:text-white transition font-bricolage_grotesque"
            >
              Terms and conditions
            </a>
            <a
              href="https://everwintrade.com/legal/aml"
              className="text-gray-400 hover:text-white transition font-bricolage_grotesque"
            >
              Legal AML
            </a>
          </div>
        </div>

        {/* More */}
        <div className="flex flex-col gap-4">
          <p className="text-white text-lg font-semibold font-bricolage_grotesque">
            More…
          </p>

          <div className="flex flex-col gap-2">
            <a
              href="https://everwintrade.com/legal/withdrawal-policy"
              className="text-gray-400 hover:text-white transition font-bricolage_grotesque"
            >
              Withdrawal Policy
            </a>
            <a
              href="https://everwintrade.com/legal/risk-disclosure"
              className="text-gray-400 hover:text-white transition font-bricolage_grotesque"
            >
              Risk Disclosure
            </a>
            <a
              href="https://everwintrade.com/legal/order-execution"
              className="text-gray-400 hover:text-white transition font-bricolage_grotesque"
            >
              Order Fulfillment
            </a>
            <a
              href="https://everwintrade.com/legal/margin-trading"
              className="text-gray-400 hover:text-white transition font-bricolage_grotesque"
            >
              Margin Trading
            </a>
            <a
              href="https://everwintrade.com/legal/cookies"
              className="text-gray-400 hover:text-white transition font-bricolage_grotesque"
            >
              Cookies
            </a>
            <a
              href="https://everwintrade.com/legal/demo-accounts"
              className="text-gray-400 hover:text-white transition font-bricolage_grotesque"
            >
              Demo and tournament
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
