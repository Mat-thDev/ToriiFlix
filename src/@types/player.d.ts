declare namespace Player {

  interface MediaPayload {
    item: Media.Item;
    details?: Media.Details
  }

  interface StreamConfig {
    id: string | number;
    stream: Media.Stream;
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
