//
import { useTranslation } from "react-i18next";

export type AssetCardProps = {
  iconUrl: string;

  // mantém compatível com seu layout atual
  profitIconUrl: string;
  profitPercentage: string;

  price: string;

  // ✅ NOVO: passe o valor numérico da variação (ex: change5mPct)
  // Se você passar isso, o AssetCard calcula seta + cor + texto sozinho.
  variationValue?: number;

  // (opcional) fallback antigo: se você NÃO passar variationValue,
  // ele usa essas props como antes.
  variation?: string;
  variationClassName?: string;

  iconContainerClassName: string;
  wrapperClassName?: string;
};


export const AssetCard = (props: AssetCardProps) => {
  const { t } = useTranslation();

  return (
    <div className={props.wrapperClassName}>
      <div className="relative box-border caret-transparent content-start items-start backdrop-blur-[5px] bg-gray-900 gap-x-4 flex flex-col h-min justify-center gap-y-4 w-min overflow-hidden px-6 py-8 rounded-[21px] after:accent-auto after:box-border after:caret-transparent after:text-black after:block after:text-xs after:not-italic after:normal-nums after:font-normal after:h-full after:tracking-[normal] after:leading-[normal] after:list-outside after:list-disc after:pointer-events-none after:absolute after:text-start after:indent-[0px] after:normal-case after:visible after:w-full after:border-gray-800/50 after:rounded-[21px] after:border-separate after:border-2 after:border-solid after:left-0 after:top-0 after:font-sans_serif">
        <div className={props.iconContainerClassName}>
          <div className="box-border caret-transparent h-full w-full">
            <img
              src={props.iconUrl}
              alt="Icon"
              className="box-border caret-transparent h-full w-full"
            />
          </div>
        </div>

        <div className="relative content-start items-start box-border caret-transparent gap-x-2 flex flex-col shrink-0 h-min justify-start gap-y-2 w-min">
          <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start text-nowrap">
            <p className="text-neutral-100/60 text-[10px] box-border caret-transparent leading-[10px] text-center text-nowrap font-sora">
              {t("asset_card.profit")}
            </p>
          </div>

          <div className="relative content-start items-start box-border caret-transparent gap-x-[3px] flex shrink-0 h-min justify-start gap-y-[3px] w-min">
            <div className="relative box-border caret-transparent shrink-0 h-6 w-[7px]">
            </div>

            <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start text-nowrap">
              <p className="text-emerald-500 text-[32px] box-border caret-transparent text-center text-nowrap font-sora">
                {props.profitPercentage}
              </p>
            </div>
          </div>
        </div>

        <div className="relative content-start items-start box-border caret-transparent gap-x-[29px] flex shrink-0 h-min justify-start gap-y-[29px] w-min">
          <div className="relative content-start items-start box-border caret-transparent gap-x-2 flex flex-col shrink-0 h-min justify-start gap-y-2 w-min">
            <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start text-nowrap">
              <p className="text-neutral-100/60 text-[10px] box-border caret-transparent leading-[10px] text-center text-nowrap font-sora">
                {t("asset_card.price")}
              </p>
            </div>

            <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start text-nowrap">
              <p className="text-neutral-100 text-base box-border caret-transparent leading-4 text-center text-nowrap font-sora">
                {props.price}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
