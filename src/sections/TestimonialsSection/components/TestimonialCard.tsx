// everwin-page/src/sections/TestimonialsSection/components/TestimonialCard.tsx
export type TestimonialCardProps = {
  imageUrl: string;
  imageClassName: string;
  testimonialText: string;
  authorName: string;
  authorAge: number;
  showIcon?: boolean;
  iconUrl?: string;
  containerVariant: string;
};

export const TestimonialCard = (props: TestimonialCardProps) => {
  return (
    <div
      className={`relative content-start items-start bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] box-border caret-transparent gap-x-6 flex flex-col shrink-0 h-min justify-center gap-y-6 w-full overflow-hidden p-8 rounded-2xl ${props.containerVariant}`}
    >
      <div className="relative aspect-square box-border caret-transparent shrink-0 w-[60px] rounded-[100%]">
        <div className="absolute box-border caret-transparent rounded-[100%] inset-0">
          <img
            src={props.imageUrl}
            alt=""
            className={`box-border caret-transparent h-full object-cover w-full rounded-[100%] ${props.imageClassName}`}
          />
        </div>
      </div>
      <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start break-words w-full">
        <p className="text-white text-base box-border caret-transparent leading-[26px] break-words font-bricolage_grotesque">
          {props.testimonialText}
        </p>
      </div>
      <div className="relative content-start items-start box-border caret-transparent gap-x-2 flex flex-col shrink-0 h-min justify-start gap-y-2 w-[81%]">
        <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start text-nowrap">
          <p className="text-white text-lg font-semibold box-border caret-transparent leading-[21.6px] text-nowrap font-bricolage_grotesque">
            {props.authorName}, {props.authorAge}
          </p>
        </div>
        <div
          className={`relative box-border caret-transparent shrink-0 h-[25px] w-[120px] ${props.showIcon ? "" : 'bg-[url(data:image/svg+xml,<svg%20xmlns="http://www.w3.org/2000/svg"%20xmlns:xlink="http://www.w3.org/1999/xlink"%20viewBox="0%200%20120%2025"><path%20d="M%2012%2017.576%20L%2018.18%2021.306%20L%2016.54%2014.276%20L%2022%209.546%20L%2014.81%208.936%20L%2012%202.306%20L%209.19%208.936%20L%202%209.546%20L%207.46%2014.276%20L%205.82%2021.306%20Z"%20fill="rgb(255,247,0)] bg-size-[100%_100%]'}`}
        >
          {props.showIcon && props.iconUrl && (
            <div className="box-border caret-transparent h-full w-full">
              <img
                src={props.iconUrl}
                alt="Icon"
                className="box-border caret-transparent h-full w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
