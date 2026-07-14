"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "everwin_announcement_closed_v1";

export function useAnnouncementBar() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  const close = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setVisible(false);
  };

  return { visible, close };
}
