import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import WindowControls from "./WindowControls";
import useClock from "../../hooks/useClock";
import useNavigation from "../../hooks/useNavigation";
import useProfile from "../../hooks/useProfile";

/** Delta de scroll (px) antes da TopBar reagir (esconder/ganhar fundo). */
const SCROLL_THRESHOLD = 16;

const TopBar = () => {
  const clock = useClock();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { currentPage } = useNavigation();
  const { activeProfile } = useProfile();
  const lastTopRef = useRef(0);
  const userName = activeProfile?.display_name ?? "";

  // Scroll direcional: descer esconde a barra (conteudo limpo), subir
  // traz de volta com fundo solido — conteudo nunca passa por baixo do texto
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".torii-scroll-y");
    if (!root) return;

    let frame = 0;
    lastTopRef.current = root.scrollTop;

    const onScroll = () => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const top = root.scrollTop;
        const scrollingDown = top > lastTopRef.current;
        lastTopRef.current = top;

        const past = top > SCROLL_THRESHOLD;
        setScrolled(past);
        setHidden(past && scrollingDown);
      });
    };

    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      root.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Troca de pagina: barra volta a aparecer (o main pode mudar de scroll
  // sem eventos na nova arvore)
  useEffect(() => {
    setHidden(false);
    setScrolled(false);
    lastTopRef.current = 0;
  }, [currentPage]);

  // Search tem o proprio campo no topo (referencia TV) — sem sobreposicao
  if (currentPage === "Search") return null;

  return (
    <header
      className={clsx(
        "absolute top-0 right-0 left-0 shrink-0 px-8 transition-all duration-300 ease-out z-99",
        scrolled ? "pt-3 pb-3" : "pt-6",
        scrolled &&
        "bg-base-300/85 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.7)] backdrop-blur-md",
        hidden && "pointer-events-none -translate-y-full opacity-0",
      )}
    >
      <div data-tauri-drag-region className="flex items-start justify-between">
        <div className="" />

        <div className="flex items-start gap-3">
          {/* Saudação + relógio */}
          <div className="text-right">
            <p className="text-sm text-base-content/70">
              {clock.greeting}
              {userName && (
                <>
                  , <span className="font-semibold text-base-content">{userName}</span>
                </>
              )}
            </p>
            <p className="mt-0.5 text-xs tracking-widest text-base-content/50">
              {clock.time} · {clock.date}
            </p>
          </div>

          {/* desktop apenas — webOS não tem janela para controlar */}
          <WindowControls />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
