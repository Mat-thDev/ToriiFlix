/**
 * Tipagens das configurações do app (persistidas via useSettings).
 * Uso: `AppSettings.Settings`, `AppSettings.Theme`, ...
 */
declare namespace AppSettings {
  /** Temas visuais disponíveis (ver src/styles/themes). */
  type Theme = "torii" | "torii-cinema" | "torii-ember" | "torii-ink" | "torii-noir";

  /** Limite de resolução dos streams. */
  type Quality = "auto" | "1080p" | "720p";

  /** Tamanho das capas no catálogo. */
  type CardDensity = "compact" | "comfortable";

  /** Quando a barra lateral aparece. */
  type SidebarMode = "always" | "focus";

  /** Preferências de reprodução. */
  interface Playback {
    autoSubtitles: boolean;
    maxQuality: Quality;
    skipIntros: boolean;
  }

  /** Aparência e layout. */
  interface Appearance {
    theme: Theme;
    animations: boolean;
    cardDensity: CardDensity;
    sidebarMode: SidebarMode;
    windowControls: boolean;
  }

  /** Configurações gerais de sistema. */
  interface System {
    language: string;
    startWithSystem: boolean;
  }

  /** Raiz das configurações — cada seção é um subgroupo persistido. */
  interface Settings {
    playback: Playback;
    appearance: Appearance;
    system: System;
  }

  /** Nome de uma seção (chave da raiz). */
  type Section = keyof Settings;
}
