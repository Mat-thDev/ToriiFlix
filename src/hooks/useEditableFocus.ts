import { useEffect } from "react";
import { setKeyMap, SpatialNavigation } from "@noriginmedia/norigin-spatial-navigation-core";
import { isExitTypingEvent, isTypingTarget } from "../platform/input";

/**
 * Libera as teclas do remote (setas/Enter) enquanto o foco está em um campo
 * de texto: o adapter do norigin faz preventDefault das teclas mapeadas antes
 * de chegar ao serviço, então `pause()` não basta — o mapa é esvaziado com
 * arrays vazios (não casam com keyCode) e restaurado ao sair do campo.
 */
const useEditableFocus = () => {
  useEffect(() => {
    let savedKeyMap: ReturnType<typeof SpatialNavigation.getKeyMap> | null = null;

    const release = () => {
      if (savedKeyMap) return; // já liberado (focusin dentro do próprio campo)
      savedKeyMap = SpatialNavigation.getKeyMap();
      setKeyMap({ left: [], up: [], right: [], down: [], enter: [] });
    };

    const restore = () => {
      if (!savedKeyMap) return;
      setKeyMap(savedKeyMap);
      savedKeyMap = null;
    };

    const onFocusIn = (e: FocusEvent) => {
      if (isTypingTarget(e.target)) release();
      else restore();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Esc/461 (webOS) sai do campo e devolve as teclas à navegação espacial.
      // Backspace fica de fora: é para apagar texto (isBackEvent já o ignora aqui).
      if (e.defaultPrevented || !isExitTypingEvent(e) || !isTypingTarget(e.target)) return;
      e.preventDefault();
      (e.target as HTMLElement).blur();
      restore();
    };

    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("keydown", onKeyDown);
      restore();
    };
  }, []);
};

export default useEditableFocus;
