// everwin-page/src/sections/TradingSection/components/TradingVisual.tsx
const MiniStepper = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-gray-200/80 flex items-center justify-center text-gray-700 font-semibold">
        –
      </div>
      <div className="h-8 w-8 rounded-lg bg-gray-200/80 flex items-center justify-center text-gray-700 font-semibold">
        +
      </div>
    </div>
  );
};

export const TradingVisual = () => {
  return (
    <div className="relative w-full md:w-[560px] h-[560px] overflow-visible">
      {/* green block */}
      <div className="absolute z-0 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 top-1/2 -translate-y-1/2 w-[320px] md:w-[360px] h-[520px] bg-emerald-500 rounded-[48px]" />

      {/* blurred "Purchase entry" behind */}
      <div className="absolute z-[1] left-1/2 -translate-x-1/2 md:left-[26px] md:translate-x-0 top-[34px] w-[min(460px,92%)] md:w-[460px] rounded-[22px] bg-white/90 shadow-[0_28px_70px_rgba(15,23,42,0.14)] blur-[2.8px] opacity-80">
        <div className="px-8 pt-7 pb-8">
          <div className="text-emerald-600 font-bricolage_grotesque font-semibold text-center">
            Purchase entry
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <div className="text-gray-700 font-bricolage_grotesque text-sm">
                Entry Value:
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-900/10 backdrop-blur-md px-5 py-3">
                <div className="flex items-center gap-2 font-bricolage_grotesque text-gray-800 text-xl">
                  <span>$</span>
                  <span className="font-medium">100</span>
                </div>
                <MiniStepper />
              </div>
            </div>

            <div>
              <div className="text-gray-700 font-bricolage_grotesque text-sm">
                Expiration:
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-900/10 backdrop-blur-md px-5 py-3">
                <div className="flex items-center gap-2 font-bricolage_grotesque text-gray-800 text-xl">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-400/40">
                    ⏱
                  </span>
                  <span className="font-medium">5m</span>
                </div>
                <MiniStepper />
              </div>
            </div>
          </div>

          <div className="mt-10 h-14 rounded-xl bg-gray-800" />
        </div>
      </div>

      {/* front "Sales Entry" */}
      <div className="absolute z-[2] left-1/2 -translate-x-1/2 md:left-[110px] md:translate-x-0 top-[255px] md:top-[230px] w-[min(460px,92%)] md:w-[460px] rounded-[22px] bg-white shadow-[0_34px_90px_rgba(15,23,42,0.20)]">
        <div className="h-[54px] flex items-center justify-center border-b border-gray-200">
          <p className="text-red-600 font-bricolage_grotesque font-semibold">
            Sales Entry
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-gray-800 font-bricolage_grotesque text-sm">
                Entry Value:
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-900/10 backdrop-blur-md px-5 py-3">
                <div className="flex items-center gap-2 font-bricolage_grotesque text-gray-800 text-xl">
                  <span>$</span>
                  <span className="font-medium">432</span>
                </div>
                <MiniStepper />
              </div>
            </div>

            <div>
              <div className="text-gray-800 font-bricolage_grotesque text-sm">
                Expiration:
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-900/10 backdrop-blur-md px-5 py-3">
                <div className="flex items-center gap-2 font-bricolage_grotesque text-gray-800 text-xl">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-400/40">
                    ⏱
                  </span>
                  <span className="font-medium">10m</span>
                </div>
                <MiniStepper />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-10 w-full h-14 rounded-xl bg-gray-800 text-white font-bricolage_grotesque font-medium"
          >
            Sell
          </button>
        </div>
      </div>
    </div>
  );
};
