import { Outlet } from "react-router-dom";
import { Navbar } from "../../../components/Navbar";
import { DisclaimerBanner } from "../../../components/DisclaimerBanner";
import { Footer } from "../../../sections/Footer";

export function PropPageLayout() {
  return (
    <div className="bg-neutral-100 text-black font-sans_serif">
      <Navbar />
      <DisclaimerBanner />

      <main className="pt-16 md:pt-[78px]">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
