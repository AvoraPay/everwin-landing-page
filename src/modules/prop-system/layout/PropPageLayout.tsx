import { Outlet } from "react-router-dom";
import { AnnouncementBar } from "../../../components/AnnouncementBar";
import { Navbar } from "../../../components/Navbar";
import { DisclaimerBanner } from "../../../components/DisclaimerBanner";
import { Footer } from "../../../sections/Footer";
import { useAnnouncementBar } from "../../../hooks/useAnnouncementBar";

export function PropPageLayout() {
  const { visible: announcementVisible } = useAnnouncementBar();

  return (
    <div className="min-h-screen bg-[linear-gradient(187deg,rgb(246,247,249)_-24%,rgb(224,227,235)_100%)] text-black font-sans_serif">
      <AnnouncementBar />
      <Navbar />
      <DisclaimerBanner />

      <main
        className="transition-[padding] duration-150"
        style={{ paddingTop: announcementVisible ? "100px" : "64px" }}
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
