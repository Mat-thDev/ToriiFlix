declare namespace AppSettings {
  type Theme =
    | "torii"
    | "torii-cinema"
    | "torii-ember"
    | "torii-ink"
    | "torii-noir"
    | "torii-sakura"
    | "torii-ocean"
    | "torii-jade";

  type Quality = "auto" | "1080p" | "720p";
  type CardDensity = "compact" | "comfortable";
  type SidebarMode = "always" | "focus";

  type SubtitleSize = "small" | "medium" | "large";
  type SubtitleFont = "default" | "sans" | "serif" | "mono";
  type SubtitleBackground = "dark" | "black" | "transparent";

  interface Playback {
    autoSubtitles: boolean;
    maxQuality: Quality;
    volume: number;
    skipIntros: boolean;
    autoPlay: boolean;
    saveHistory: boolean;
    autoNextEpisode: boolean;
    subtitleSize: SubtitleSize;
    subtitleFont: SubtitleFont;
    subtitleBackground: SubtitleBackground;
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
