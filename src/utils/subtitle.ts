/**
 * Valores concretos das legendas — fonte única usada pelo SubtitleOverlay
 * (player) e pela prévia nas Settings, pra preview e reprodução nunca
 * divergirem.
 */
export const SUBTITLE_SIZE: Record<AppSettings.SubtitleSize, string> = {
  small: "0.8rem",
  medium: "1rem",
  large: "1.3rem",
};

export const SUBTITLE_FONT: Record<AppSettings.SubtitleFont, string> = {
  default: "inherit",
  sans: "sans-serif",
  serif: "serif",
  mono: "monospace",
};

export const SUBTITLE_BACKGROUND: Record<AppSettings.SubtitleBackground, string> = {
  dark: "rgba(0, 0, 0, 0.75)",
  black: "#000000",
  transparent: "transparent",
};
