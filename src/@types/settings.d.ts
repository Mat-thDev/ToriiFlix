declare namespace AppSettings {
  type Theme = "torii" | "torii-cinema" | "torii-ember" | "torii-ink" | "torii-noir";

  type Quality = "auto" | "1080p" | "720p";
  type CardDensity = "compact" | "comfortable";
  type SidebarMode = "always" | "focus";

  interface Playback {
    autoSubtitles: boolean;
    maxQuality: Quality;
    volume: number;
    skipIntros: boolean;
    autoPlay: boolean;
    saveHistory: boolean;
    autoNextEpisode: boolean;
  }

  interface Appearance {
    theme: Theme;
    animations: boolean;
    cardDensity: CardDensity;
    sidebarMode: SidebarMode;
    windowControls: boolean;
  }

  interface System {
    language: string;
    startWithSystem: boolean;
  }

  interface Addons {
    tmdbApiKey?: string
    torboxApiKey?: string
  }

  interface Settings {
    playback: Playback;
    appearance: Appearance;
    system: System;
    addons: Addons
  }

  type Section = keyof Settings;
}
