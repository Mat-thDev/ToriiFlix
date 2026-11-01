import { Pause, Play } from "lucide-react";
import { PlayButton as VideoJsPlayButton } from "@videojs/react";

const PlayButton = () => (
  <VideoJsPlayButton
    className="flex size-11 items-center justify-center rounded-(--radius-field) p-0 text-base-content transition-colors hover:bg-base-content/10 hover:text-primary"
    render={(props, state) => (
      <button {...props} aria-label={state.paused ? "Reproduzir" : "Pausar"}>
        {state.paused ? (
          <Play className="size-7 fill-current" />
        ) : (
          <Pause className="size-7 fill-current" />
        )}
      </button>
    )}
  />
);

export default PlayButton;
