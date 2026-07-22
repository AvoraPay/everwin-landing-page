// everwin-page/src/sections/Hero/components/HeroImage.tsx
export const HeroImage = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-t-[34px] border border-gray-800/50 bg-gray-900">
      <div className="aspect-[1600/882] w-full">
        <img
          src="https://i.postimg.cc/2jZMmfp1/image-(1).png?width=1600&height=882"
          alt=""
          className="h-full w-full object-cover mix-blend-exclusion"
          draggable={false}
        />
      </div>
    </div>
  );
};
