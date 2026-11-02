declare namespace Player {

  interface PlayerSurfaceProps {
    src?: string;
    backgroundImage?: string;
    autoPlay?: boolean;
    muted?: boolean;
    className?: string;
    children?: React.ReactNode
  }

  type ChannelRailProps = {
    channels: Media.Item[];
    selectedId?: string;
    onSelect: (channel: Media.Item) => void;
    visible: boolean;
    onActivity?: () => void;
  };

  interface MediaPayload {
    item: Media.Item;
    details?: Media.Details
  }

  interface StreamConfig {
    id: string | number;
    stream: Media.Stream;
    /** Episódio em reprodução (séries) — distingue o histórico/resume por episódio. */
    episode?: Media.EpisodeRef;
    media: MediaPayload
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
