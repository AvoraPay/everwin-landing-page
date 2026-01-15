// everwin-page/src/sections/Footer/components/FooterContent.tsx
import { Link } from "react-router-dom";



const POLICIES = [
  { label: "Privacy", to: "/legal/privacy" },
  { label: "Payment", to: "/legal/payment-policy" },
  { label: "General Fees", to: "/legal/general-fees" },
  { label: "Terms and conditions", to: "/legal/terms" },
  { label: "Legal AML", to: "/legal/aml" },
];

const MORE = [
  { label: "Withdrawal Policy", to: "/legal/withdrawal-policy" },
  { label: "Risk Disclosure", to: "/legal/risk-disclosure" },
  { label: "Order Fulfillment", to: "/legal/order-execution" },
  { label: "Margin Trading", to: "/legal/margin-trading" },
  { label: "Cookies", to: "/legal/cookies" },
  { label: "Demo and tournament", to: "/legal/demo-accounts" },
];

function linkCls(extra?: string) {
  return [
    "text-gray-400 hover:text-white transition font-bricolage_grotesque",
    "text-sm leading-6",
    extra ?? "",
  ].join(" ");
}

export const FooterContent = () => {
  

  return (
    <div className="mx-auto w-[90%] max-w-[1060px] flex flex-col gap-10 md:flex-row md:gap-10">
      {/* Brand */}
      <div className="flex flex-col gap-4 md:w-[320px]">
        <Link to="/" className="h-[37px] w-[131px] block" aria-label="Everwin Home">
          <img
            src="https://i.postimg.cc/RFLkLvK0/everwin-logo.png"
            alt="Everwin"
            className="h-full w-full object-contain"
            draggable={false}
          />
        </Link>

        <p className="font-bricolage_grotesque text-base leading-[22px] text-white">
          One brokerage firm,{" "}
          <span className="text-emerald-500">countless investment opportunities.</span>
        </p>
      </div>

      {/* Columns */}
      <div className="flex flex-col gap-10 md:flex-row md:flex-1 md:justify-between">
        {/* Company */}
        <div className="flex flex-col gap-4">
        </div>

        {/* Policies */}
        <div className="flex flex-col gap-4">
          <p className="text-white text-lg font-semibold font-bricolage_grotesque">
            Policies
          </p>

          <div className="flex flex-col gap-2">
            {POLICIES.map((it) => (
              <Link key={it.to} to={it.to} className={linkCls()}>
                {it.label}
              </Link>
            ))}
          </div>
        </div>

        {/* More */}
        <div className="flex flex-col gap-4">
          <p className="text-white text-lg font-semibold font-bricolage_grotesque">
            Legal
          </p>

          <div className="flex flex-col gap-2">
            {MORE.map((it) => (
              <Link key={it.to} to={it.to} className={linkCls()}>
                {it.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
