// src/App.tsx
import { Outlet } from "react-router-dom";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { Navbar } from "./components/Navbar";
import { Footer } from "./sections/Footer";

export const App = () => {
  return (
    <div className="-screen bg-neutral-100 text-black font-sans_serif">
      <Navbar />
      <DisclaimerBanner />

      <main className="pt-16 md:pt-[78px]">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
