import { useEffect, useState } from "react";

/** Relógio/saudação exibido na TopBar (atualiza a cada 30s). */
const useClock = (): UI.Clock => {
  const [clock, setClock] = useState<UI.Clock>(() => formatClock(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock(new Date())), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return clock;
};

const formatClock = (now: Date): UI.Clock => {
  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  const date = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  })
    .format(now)
    .replace(/\./g, "")
    .toUpperCase();

  const hour = now.getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return { time, date, greeting };
};

export default useClock;
