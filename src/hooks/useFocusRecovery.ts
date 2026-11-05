import { useEffect } from "react";
import { SpatialNavigation } from "@noriginmedia/norigin-spatial-navigation-core";
import { isTypingTarget } from "../platform/input";

const ARROWS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  // Variantes de tecla que alguns remotes webOS mandam no lugar das Arrow*
  "Left",
  "Right",
  "Up",
  "Down",
]);

/**
 * Rede de segurança da navegação espacial (norigin) no remote:
 * - foco nulo/removido (ex.: desmontagem sem restauração — no PC um clique
 *   re-sincroniza, na TV não existe mouse) → reancora na SIDEBAR;
 * - foco preso num container (seção que nasceu antes do conteúdo: o autoFocus
 *   desce uma única vez e o norigin nunca desce em setas) → re-emite setFocus
 *   para descer até o primeiro filho focável.
 * Capture na window: roda depois dos handlers filhos (player/modais/busca
 * cortam a propagação antes) e antes do norigin (bubble na window).
 */
const useFocusRecovery = () => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || !ARROWS.has(e.key)) return;
      if (isTypingTarget(e.target)) return; // campo de texto: seta é do cursor
      if (document.querySelector("dialog[open]")) return; // modal: norigin navega o modal

      const focusKey = SpatialNavigation.getCurrentFocusKey();
      if (!focusKey || !SpatialNavigation.doesFocusableExist(focusKey)) {
        if (SpatialNavigation.doesFocusableExist("SIDEBAR")) SpatialNavigation.setFocus("SIDEBAR");
        return;
      }

      // O norigin marca [data-focused] no nó atual; um nó sem foco nativo
      // (div de seção) nunca vira activeElement → sinal de foco preso nele.
      const focused = document.querySelector("[data-focused]");
      const native =
        focused instanceof HTMLElement &&
        focused.matches("button, a, input, select, textarea, [tabindex]");
      if (focused && focused !== document.activeElement && !native) {
        SpatialNavigation.setFocus(focusKey);
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);
};

export default useFocusRecovery;
