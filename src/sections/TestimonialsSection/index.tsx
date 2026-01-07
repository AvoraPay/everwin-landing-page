// everwin-page/src/sections/TestimonialsSection/index.tsx
import { TestimonialCard } from "./components/TestimonialCard";
import { StatCard } from "./components/StatCard";

export const TestimonialsSection = () => {
  return (
    <div className="relative content-center items-center box-border caret-transparent gap-x-[60px] flex flex-col shrink-0 h-min justify-center gap-y-[60px] w-full py-0 scroll-mt-[78px] md:pt-[90px] md:pb-[100px]">
      <div className="box-border caret-transparent contents">
        <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start break-words text-wrap w-[90%] md:text-nowrap md:w-auto md:break-normal">
          <p className="text-gray-800 text-[32px] box-border caret-transparent leading-[30.08px] break-words text-center text-wrap font-bricolage_grotesque md:text-nowrap md:break-normal">
            Learn a little about
          </p>
          <p className="text-gray-800 text-[62px] font-semibold box-border caret-transparent leading-[58.28px] break-words text-center text-wrap font-bricolage_grotesque md:text-nowrap md:break-normal">
            our achievements
          </p>
        </div>
      </div>

      <div className="relative content-center items-center box-border caret-transparent gap-x-5 flex shrink-0 flex-wrap h-min justify-center max-w-[1060px] gap-y-5 w-[90%] z-[2]">
        <div className="relative content-center items-center self-stretch box-border caret-transparent gap-x-2.5 flex basis-0 flex-col grow shrink-0 justify-center min-w-[300px] gap-y-2.5 w-px overflow-hidden">
          <TestimonialCard
            imageUrl="https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDh8fHxlbnwwfHx8fHw%3D"
            imageClassName="aspect-[auto_632_/_607]"
            testimonialText="I’ve tried a few platforms, but Everwin is the first one that feels fast and easy. Clean layout, smooth execution, and no clutter."
            authorName="Lucas Ferreira"
            authorAge={28}
            showIcon={true}
            iconUrl="https://c.animaapp.com/mk284v6uqUa07j/assets/icon-36.svg"
            containerVariant="basis-auto flex basis-auto flex-col grow-0 shrink-0 md:basis-0 md:grow md:h-px"
          />
          <div className="relative content-center items-center bg-emerald-500 box-border caret-transparent gap-x-6 flex basis-0 flex-col grow shrink-0 h-px justify-center gap-y-6 w-full overflow-hidden rounded-2xl">
            <StatCard
              variant="variant1"
              mainValue="$166"
              label="Million"
              description="Distributed as profits to our users!"
            />
          </div>
        </div>

        <div className="relative content-start items-start box-border caret-transparent gap-x-5 flex basis-0 flex-col grow shrink-0 h-[735px] justify-start min-w-[300px] gap-y-5 w-px">
          <StatCard
            variant="variant2"
            mainValue="700K"
            mainValueSuffix="+"
            label="Users Investing"
          />

          <div className="box-border caret-transparent contents">
            <div className="relative box-border caret-transparent gap-x-6 basis-0 grow shrink-0 h-px gap-y-6 w-full overflow-hidden rounded-2xl">
              <div className="absolute box-border caret-transparent rounded-2xl inset-0">
                <img
                  src="https://framerusercontent.com/images/eHU6PpGY1eSDVRjUFwerbQ264.jpg?width=760&height=478"
                  alt=""
                  className="aspect-[auto_760_/_478] box-border caret-transparent h-full object-cover w-full rounded-2xl"
                />
              </div>
            </div>
          </div>

          <div className="relative content-start items-start bg-[linear-gradient(178deg,rgb(24,27,36)_-88%,rgb(17,19,26)_61%)] box-border caret-transparent gap-x-6 flex flex-col shrink-0 h-min justify-center gap-y-6 w-full overflow-hidden p-8 rounded-2xl">
            <div className="relative aspect-square box-border caret-transparent shrink-0 w-[60px] rounded-[100%]">
              <div className="absolute box-border caret-transparent rounded-[100%] inset-0">
                <img
                  src="https://img.freepik.com/free-photo/selfie-portrait-videocall_23-2149186122.jpg?semt=ais_hybrid&w=740&q=80"
                  alt=""
                  className="aspect-[auto_636_/_617] box-border caret-transparent h-full object-cover w-full rounded-[100%]"
                />
              </div>
            </div>

            <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start break-words w-full">
              <p className="text-white text-base box-border caret-transparent leading-[26px] break-words font-bricolage_grotesque">
                As a beginner, I wanted something straightforward. Everwin made it simple to place orders, track results, and learn as I go.
              </p>
            </div>

            <div className="relative content-start items-start box-border caret-transparent gap-x-2 flex flex-col shrink-0 h-min justify-start gap-y-2 w-[81%]">
              <div className="relative box-border caret-transparent flex flex-col shrink-0 justify-start text-nowrap">
                <p className="text-white text-lg font-semibold box-border caret-transparent leading-[21.6px] text-nowrap font-bricolage_grotesque">
                  Sarah Lance, 43
                </p>
              </div>
              <div className="relative box-border caret-transparent shrink-0 h-[25px] w-[120px]">
                <div className="box-border caret-transparent h-full w-full">
                  <img
                    src="https://c.animaapp.com/mk284v6uqUa07j/assets/icon-37.svg"
                    alt="Icon"
                    className="box-border caret-transparent h-full w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative content-start items-start self-stretch box-border caret-transparent gap-x-5 flex basis-0 flex-col grow shrink-0 justify-start min-w-[300px] gap-y-5 w-px">
          <TestimonialCard
            imageUrl="https://img.freepik.com/free-photo/close-up-portrait-curly-handsome-european-male_176532-8133.jpg?semt=ais_hybrid&w=740&q=80"
            imageClassName="aspect-[auto_640_/_594]"
            testimonialText="The experience feels premium: fast interactions, clear information, and tutorials that actually help. Everwin is now my daily pick."
            authorName="Gustavo Almeida"
            authorAge={31}
            showIcon={false}
            containerVariant="order-1"
          />
          <div className="box-border caret-transparent contents">
            <div className="relative box-border caret-transparent gap-x-6 basis-0 grow shrink-0 h-px min-h-[200px] gap-y-6 w-full overflow-hidden rounded-2xl">
              <div className="absolute box-border caret-transparent rounded-2xl inset-0">
                <img
                  src="https://framerusercontent.com/images/3IjHoWiwwiekZqIX7clqwFxCk.webp?width=341&height=307"
                  alt=""
                  className="aspect-[auto_341_/_307] box-border caret-transparent h-full object-cover w-full rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        <StatCard
          variant="variant3"
          mainValue="8.397"
          mainValueSuffix="+"
          label="New traders"
          description="in the last 3 months"
          iconUrl="https://c.animaapp.com/mk284v6uqUa07j/assets/icon-38.svg"
          iconAlt="Icon"
        />
      </div>
    </div>
  );
};
