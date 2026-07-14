// src/App.tsx
import { Outlet } from "react-router-dom";
import { AnnouncementBar } from "./components/AnnouncementBar";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { Navbar } from "./components/Navbar";
import { useAnnouncementBar } from "./hooks/useAnnouncementBar";
import { Footer } from "./sections/Footer";

export const App = () => {
  const { visible: announcementVisible } = useAnnouncementBar();

  return (
    <div className="min-h-screen bg-neutral-100 text-black font-bricolage_grotesque">
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
};
