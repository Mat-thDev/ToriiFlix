declare namespace Player {
  interface StreamSource {
    name: string;
    url: string;
    iframe?: boolean;
  }

  interface Episode {
    ID: number;
    animeID: number;
    animeTitle: string;
    subtitle: string;
    title: string;
    episodio: number;
    temporada: number;
    capa?: string;
    action?: [number, number];
    seasonEpisodes?: Episode[];
  }

  interface Chapter {
    identificator: string;
    startTime: number;
    endTime: number;
  }

  interface StreamConfig {
    streamURL: string;
    streamThumbnail: string;
    streamID: number;
    mediaData: Media.Details
  }

  interface ProgressEntry {
    episodeId: number;
    progress: number;
    duration: number;
  }

  interface PlayerPrefs {
    autoplay: boolean;
    volume: number;
    saveHistory: boolean;
    autoNextEpisode: boolean;
  }

  interface ToriiPlayerProps {
    episodeData?: Episode;
    ID?: number;
    onEpisodeSelect?: (episode: Episode) => void;
    onBack?: () => void;
    onNextEpisode?: (episodeId: number) => void;
  }

  interface BackButtonProps {
    onClick?: () => void;
  }

  interface SkipButtonProps {
    time: number;
  }

  interface SeekBarProps {
    episodeData?: Episode;
    showSkipBar?: boolean;
    disabled?: boolean;
    onNextEpisode?: (episodeId: number) => void;
  }

  interface SkipBarProps {
    chapter?: Chapter;
    duration: number;
    nextEpisodeId?: number;
    showNextEpisode?: boolean;
    onNextEpisode?: (episodeId: number) => void;
  }

  interface SeasonBrowserProps {
    episode?: Episode;
    onEpisodeSelect?: (episode: Episode) => void;
  }

  interface SourceDecoderProps {
    episodeData?: Episode;
    ID: number;
    sources?: StreamSource[];
  }

  interface TimestampProps {
    type: "current" | "duration" | "remaining";
  }

  interface ControlsProps {
    children: React.ReactNode;
  }

  interface ControlsRowProps {
    children: React.ReactNode;
    top?: boolean;
    bottom?: boolean;
  }
}
