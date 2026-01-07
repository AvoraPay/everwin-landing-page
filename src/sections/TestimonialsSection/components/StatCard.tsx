// everwin-page/src/sections/TestimonialsSection/components/StatCard.tsx
export type StatCardProps = {
  variant: string;
  mainValue: string;
  mainValueSuffix?: string;
  label: string;
  description?: string;
  iconUrl?: string;
  iconAlt?: string;
};

export const StatCard = (props: StatCardProps) => {
  if (props.variant === "variant1") {
    return (
      <div className="relative content-center items-center box-border caret-transparent gap-x-6 flex shrink-0 gap-y-6 flex-col h-min justify-start w-[276px]">
        <div className="relative box-border caret-transparent flex flex-col shrink-0 content-center items-center gap-x-0 h-min justify-center gap-y-0 w-min">
          <div className="box-border caret-transparent contents">
            <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start text-nowrap">
              <p className="text-white text-6xl font-bold box-border caret-transparent leading-[72px] text-nowrap font-bricolage_grotesque">
                {props.mainValue}
              </p>
            </div>
          </div>
          <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-center h-12 break-words w-[236px]">
            <p className="text-white text-[52.9px] box-border caret-transparent leading-[63.48px] break-words text-center font-bricolage_grotesque">
              {props.label}
            </p>
          </div>
        </div>
        <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start break-words w-[276px]">
          <p className="box-border caret-transparent font-bricolage_grotesque text-white text-lg leading-[26px] break-words text-center">
            {props.description}
          </p>
        </div>
      </div>
    );
  }

  if (props.variant === "variant2") {
    return (
      <div className="relative content-center items-center box-border caret-transparent gap-x-6 flex shrink-0 gap-y-6 bg-neutral-100 flex-wrap h-[98px] justify-center w-full overflow-hidden rounded-2xl md:flex-nowrap after:accent-auto after:box-border after:caret-transparent after:text-black after:block after:text-xs after:not-italic after:normal-nums after:font-normal after:h-full after:tracking-[normal] after:leading-[normal] after:list-outside after:list-disc after:pointer-events-none after:absolute after:text-start after:indent-[0px] after:normal-case after:visible after:w-full after:border after:border-emerald-500 after:rounded-2xl after:border-separate after:border-solid after:left-0 after:top-0 after:font-sans_serif">
        <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start text-nowrap">
          <p className="text-gray-800 text-[55.7px] font-semibold box-border caret-transparent leading-[66.84px] text-nowrap font-bricolage_grotesque">
            {props.mainValue}
            {props.mainValueSuffix && (
              <span className="text-emerald-500 font-normal box-border caret-transparent text-nowrap">
                {props.mainValueSuffix}
              </span>
            )}
          </p>
        </div>
        <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start text-nowrap">
          <p className="box-border caret-transparent font-bricolage_grotesque text-gray-800 text-base leading-4 text-nowrap">
            {props.label}
          </p>
        </div>
      </div>
    );
  }

  if (props.variant === "variant3") {
    return (
      <div className="relative content-center items-center box-border caret-transparent gap-x-6 flex shrink-0 gap-y-6 basis-auto grow-0 h-min justify-center min-w-0 w-full overflow-hidden p-6 rounded-2xl md:[align-items:normal] md:block md:basis-0 md:grow md:h-[117px] md:justify-normal md:min-w-[410px] md:w-px md:p-0 after:accent-auto after:box-border after:caret-transparent after:text-black after:block after:text-xs after:not-italic after:normal-nums after:font-normal after:h-full after:tracking-[normal] after:leading-[normal] after:list-outside after:list-disc after:pointer-events-none after:absolute after:text-start after:indent-[0px] after:normal-case after:visible after:w-full after:border-zinc-200 after:rounded-2xl after:border-separate after:border-2 after:border-solid after:left-0 after:top-0 after:font-sans_serif">
        <div className="relative box-border caret-transparent flex flex-col shrink-0 content-center items-center gap-x-4 flex-wrap h-min justify-start min-h-[auto] min-w-[auto] gap-y-4 transform-none w-full left-auto top-auto md:absolute md:flex-row md:flex-nowrap md:min-h-0 md:min-w-0 md:translate-x-[-50.0%] md:translate-y-[-50.0%] md:w-min md:left-2/4 md:top-2/4">
          <div className="box-border caret-transparent relative shrink-0 h-8 w-[33px]">
            <div className="box-border caret-transparent h-full w-full">
              <img
                src={props.iconUrl}
                alt={props.iconAlt}
                className="box-border caret-transparent h-full w-full"
              />
            </div>
          </div>
          <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-center content-center items-center gap-x-[11px] h-min min-w-[310px] gap-y-[11px] w-full md:flex-row md:justify-start md:min-w-[auto] md:w-min">
            <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start text-nowrap">
              <p className="text-gray-800 text-[37px] box-border caret-transparent leading-[44.4px] text-nowrap font-bricolage_grotesque">
                {props.mainValueSuffix && (
                  <span className="text-emerald-500 box-border caret-transparent text-nowrap">
                    {props.mainValueSuffix}
                  </span>
                )}
                {props.mainValue}
              </p>
            </div>
            <div className="box-border caret-transparent contents">
              <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start break-words text-wrap w-full md:text-nowrap md:w-auto md:break-normal">
                <p className="text-gray-800 text-2xl font-semibold box-border caret-transparent leading-[22px] break-words text-wrap font-bricolage_grotesque md:text-nowrap md:break-normal">
                  <span className="text-emerald-500 box-border caret-transparent break-words text-wrap md:text-nowrap md:break-normal">
                    {props.label}
                  </span>{" "}
                  {props.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
