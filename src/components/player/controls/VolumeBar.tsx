import { Volume1, Volume2, VolumeX } from "lucide-react";
import { MuteButton, VolumeSlider } from "@videojs/react";
import { usePlayer } from "@videojs/react/video/player";
import { useRef, useEffect } from "react";
import useSettings from "../../../hooks/useSettings";

const VolumeBar = ({ playbackSettings }: { playbackSettings: AppSettings.Playback }) => {

  const { changeSetting } = useSettings()
  const store = usePlayer();
  const volumePlayer = usePlayer((s) => s.volume);
  const restored = useRef(false);

  useEffect(() => {
    if (!store.target || !restored.current) return;

    store.setVolume(playbackSettings.volume / 100);
    restored.current = true;
  }, [store, playbackSettings]);

  useEffect(() => {
    changeSetting("playback", { volume: volumePlayer * 100 });
  }, [volumePlayer]);


  return (
    <div className="flex items-center gap-2">
      <MuteButton
        className="flex items-center justify-center rounded-(--radius-field) p-2 text-base-content transition-colors hover:bg-base-content/10 hover:text-primary"
        render={(props, state) => (
          <button {...props} aria-label={state.muted ? "Ativar som" : "Desativar som"}>
            {state.muted ? (
              <VolumeX className="size-7" />
            ) : state.volumeLevel === "low" ? (
              <Volume1 className="size-7" />
            ) : (
              <Volume2 className="size-7" />
            )}
          </button>
        )}
      />

      <VolumeSlider.Root className="group relative flex h-6 w-24 items-center pointer-events-auto">
        <VolumeSlider.Track className="relative h-[0.3rem] w-full overflow-hidden rounded-full bg-base-content/30 transition-[height] group-data-interactive:h-2.5">
          <VolumeSlider.Fill className="absolute inset-y-0 left-0 w-(--media-slider-fill) bg-primary" />
        </VolumeSlider.Track>
        <VolumeSlider.Thumb className="absolute top-1/2 left-(--media-slider-fill) size-3 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-base-content transition-transform group-data-interactive:scale-100" />
        <VolumeSlider.Value
          type="pointer"
          className="pointer-events-none absolute bottom-full left-(--media-slider-pointer) mb-1.5 -translate-x-1/2 rounded-(--radius-field) border border-base-content/10 bg-base-200/90 px-1.5 py-0.5 text-[0.7rem] font-bold text-base-content opacity-0 backdrop-blur-sm transition-opacity group-data-pointing:opacity-100"
        />
      </VolumeSlider.Root>
    </div>
  );
};

export default VolumeBar;
