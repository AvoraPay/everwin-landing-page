// everwin-page/src/sections/Footer/components/FooterBottom.tsx
export const FooterBottom = () => {
  return (
    <div className="mx-auto w-[90%] max-w-[1060px] mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <p className="text-white/90 text-sm font-light leading-7 font-bricolage_grotesque">
        © 2026 Everwin, All rights reserved.
      </p>

      <div className="flex items-center gap-4">
        <p className="text-white/90 text-base font-light leading-7 font-bricolage_grotesque">
          Follow Everwin:
        </p>

        <a
          href="https://www.instagram.com/everwin"
          aria-label="Everwin on Instagram"
          className="h-[22px] w-[22px] block opacity-90 hover:opacity-100 transition"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2022%2022%27%3E%3Cpath%20fill=%27white%27%20d=%27M11%207.3a3.7%203.7%200%201%200%200%207.4%203.7%203.7%200%200%200%200-7.4Zm0%206.1a2.4%202.4%200%201%201%200-4.8%202.4%202.4%200%200%201%200%204.8Zm4.7-6.4a.9.9%200%201%201-1.8%200%20.9.9%200%200%201%201.8%200ZM18%207.9c0-1.1-.1-2.1-.6-3-.5-1-1.4-1.8-2.3-2.3-1-.5-2-.6-3-.6H9.9c-1.1%200-2.1.1-3%20.6-1%20.5-1.8%201.4-2.3%202.3-.5%201-.6%202-.6%203v4.2c0%201.1.1%202.1.6%203%20.5%201%201.4%201.8%202.3%202.3%201%20.5%202%20.6%203%20.6h4.2c1.1%200%202.1-.1%203-.6%201-.5%201.8-1.4%202.3-2.3%20.5-1%20.6-2%20.6-3V7.9Zm-1.6%205.3c0%20.8-.1%201.5-.4%202.1-.3.6-.8%201.1-1.4%201.4-.6.3-1.3.4-2.1.4H9.5c-.8%200-1.5-.1-2.1-.4-.6-.3-1.1-.8-1.4-1.4-.3-.6-.4-1.3-.4-2.1V9.4c0-.8.1-1.5.4-2.1.3-.6.8-1.1%201.4-1.4.6-.3%201.3-.4%202.1-.4h3.9c.8%200%201.5.1%202.1.4.6.3%201.1.8%201.4%201.4.3.6.4%201.3.4%202.1v3.8Z%27/%3E%3C/svg%3E")',
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
    </div>
  );
};
