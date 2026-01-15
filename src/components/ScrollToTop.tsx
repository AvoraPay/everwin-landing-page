import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Se for âncora (#assets etc), deixa o browser lidar com o hash
    if (hash) return;

    // Em mudanças de rota (ex.: /legal/privacy -> /legal/terms), volta pro topo
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return null;
}
