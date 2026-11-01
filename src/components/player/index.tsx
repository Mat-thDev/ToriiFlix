import { Suspense, useEffect, useState } from "react";
import {
  BufferingIndicator,
  Container,
  ErrorDialog,
  Gesture,
  Hotkey,
  StatusAnnouncer,
} from "@videojs/react";
import { Video, VideoPlayer } from "@videojs/react/video";

import BackButton from "./controls/BackButton";
import MediaState from "./MediaState";
import PlayButton from "./controls/PlayButton";
import PlayerControls from "./controls/PlayerControls";
import PlayerRow from "./controls/PlayerRow";
import SkipButton from "./controls/SkipButton";
import VolumeBar from "./controls/VolumeBar";
import useNavigation from "../../hooks/useNavigation";
import { toast } from "react-toastify";
import SeekBar from "./controls/SeekBar";
import useSettings from "../../hooks/useSettings";
import MediaController from "./MediaController";


const ToriiPlayer = () => {
  const { settings } = useSettings()
  const { currentPage, currentProps, goBack } = useNavigation();
  const [isPlaying, setIsPlaying] = useState(false);

  const streamConfig = currentProps as Player.StreamConfig

  useEffect(() => {
    if ((!streamConfig.stream || !streamConfig.id) && currentPage === "Watch") {
      toast.error("Falha ao inicializar o reprodutor.");
      goBack();
    }
  }, [streamConfig, goBack]);

  if (!streamConfig || !streamConfig.stream || !streamConfig.id) {
    return null;
  }

  const { id, stream, media } = streamConfig;

  return (
    <VideoPlayer
      key={id}
    >
      <Container className="fixed inset-0 z-60 h-dvh w-screen overflow-hidden bg-base-300 has-[&_[data-controls]:not([data-visible])]:cursor-none [&>video]:size-full [&>video]:object-contain [&>video]:bg-black">
        <MediaController playbackSettings={settings.playback} streamConfig={streamConfig} />
        {!isPlaying && media.item.background && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300"
            style={{ backgroundImage: `url(${media.item.background})` }}
          >
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}

        <Suspense fallback={null}>
          <Video
            src={stream.url}
            autoPlay={settings.playback.autoPlay}
            playsInline
            onPlay={() => {
              setIsPlaying(true);
            }}
          />
        </Suspense>

        <div
          className="pointer-events-none absolute right-6 bottom-6 z-1 text-xs font-bold tracking-[0.2em] text-base-content/20 uppercase"
          aria-hidden
        >
          ToriiFlix
        </div>

        <BufferingIndicator
          className="pointer-events-none absolute inset-0 z-3 flex items-center justify-center"
          render={(props, state) => (
            <div {...props}>
              <div
                className="hidden size-14 animate-spin rounded-full border-4 border-base-content/25 border-t-primary data-visible:block"
                data-visible={state.visible || undefined}
              />
            </div>
          )}
        />

        <PlayerControls>
          <PlayerRow top>
            <BackButton onClick={goBack} />
            <MediaState mediaData={media} />
          </PlayerRow>

          <PlayerRow bottom>
            <SeekBar playbackSettings={settings.playback} />
            <div className="pointer-events-auto flex w-full items-center gap-2">
              <SkipButton time={-15} />
              <PlayButton />
              <SkipButton time={15} />
              <VolumeBar playbackSettings={settings.playback} />
            </div>
          </PlayerRow>
        </PlayerControls>

        <Hotkey keys="Space" action="togglePaused" />
        <Hotkey keys="k" action="togglePaused" />
        <Hotkey keys="m" action="toggleMuted" />
        <Hotkey keys="i" action="togglePictureInPicture" />
        <Hotkey keys="ArrowRight" action="seekStep" value={10} />
        <Hotkey keys="ArrowLeft" action="seekStep" value={-10} />
        <Hotkey keys="l" action="seekStep" value={10} />
        <Hotkey keys="j" action="seekStep" value={-10} />
        <Hotkey keys="ArrowUp" action="volumeStep" value={0.1} />
        <Hotkey keys="ArrowDown" action="volumeStep" value={-0.1} />

        <Gesture type="tap" action="togglePaused" pointer="mouse" region="center" />
        <Gesture type="tap" action="toggleControls" pointer="touch" />
        <Gesture type="doubletap" action="seekStep" value={-10} region="left" />
        <Gesture type="doubletap" action="seekStep" value={10} region="right" />

        <StatusAnnouncer />
        <ErrorDialog.Root>
          <ErrorDialog.Backdrop className="absolute inset-0 z-6 bg-base-300/60" />
          <ErrorDialog.Popup className="absolute top-1/2 left-1/2 z-7 flex w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-(--radius-box) border border-base-content/10 bg-base-200 p-5 text-base-content">
            <ErrorDialog.Title />
            <ErrorDialog.Description />
            <ErrorDialog.Close className="flex items-center justify-center rounded-(--radius-field) p-2 text-base-content transition-colors hover:bg-base-content/10 hover:text-primary">
              Fechar
            </ErrorDialog.Close>
          </ErrorDialog.Popup>
        </ErrorDialog.Root>
      </Container>
    </VideoPlayer>
  );
};

export default ToriiPlayer;
