import { useAtomValue } from "jotai";
import type { Transition } from "framer-motion";
import { settingsAtom } from "../atoms/settings";

/**
 * Módulo padrão de aparência (settings) — todo componente que precisa de
 * animação/densidade/sidebar importa daqui, garantindo um único ponto de
 * verdade para as preferências de personalização.
 */

/** Seção `appearance` das settings. */
const useAppearance = () => useAtomValue(settingsAtom).appearance;

/** Animações ligadas? (framer-motion + transições CSS + scroll suave). */
export const useAnimations = () => useAppearance().animations;

/**
 * Transição padrão do app p/ framer-motion — respeita o switch de animações
 * (desligado → duration 0, o estado final é aplicado na hora).
 * Padrão único: componentes animados usam este hook em vez de valores fixos.
 */
export const useAppTransition = (
  duration = 0.35,
  ease: [number, number, number, number] = [0.22, 1, 0.36, 1],
): Transition => {
  const enabled = useAnimations();
  return { duration: enabled ? duration : 0, ease };
};

/** Largura do pôster por densidade (compacta/confortável). */
export const posterWidthFor = (density: AppSettings.CardDensity): string =>
  density === "compact" ? "w-32 md:w-36 lg:w-40" : "w-40 md:w-44 lg:w-48";

/** Largura do pôster conforme a densidade dos cards — MediaCard, skeletons e cartazes. */
export const usePosterWidth = (): string => posterWidthFor(useAppearance().cardDensity);


/** Largura do backdrop (16:9) por densidade (compacta/confortável). */
export const backdropWidthFor = (density: AppSettings.CardDensity): string =>
  density === "compact" ? "w-56 md:w-64 lg:w-72" : "w-64 md:w-72 lg:w-80";

/** Largura do backdrop conforme a densidade dos cards — MediaHorizontalCard e seus skeletons. */
export const useBackdropWidth = (): string => backdropWidthFor(useAppearance().cardDensity);

export default useAppearance;
