import { Suspense } from "react";
import {
  BufferingIndicator,
  Container,
  ErrorDialog,
  Gesture,
  Hotkey,
  StatusAnnouncer,
} from "@videojs/react";
import { Video, VideoPlayer } from "@videojs/react/video";

import BackButton from "./BackButton";
import MediaState from "./MediaState";
import PlayButton from "./PlayButton";
import PlayerControls from "./PlayerControls";
import PlayerRow from "./PlayerRow";
import SkipButton from "./SkipButton";
import VolumeBar from "./VolumeBar";
import useNavigation from "../../hooks/useNavigation";
import { toast } from "react-toastify";
import SeekBar from "./SeekBar";


const ToriiPlayer = ({ streamURL, streamThumbnail, streamID, mediaData }: Player.StreamConfig) => {

  const { goBack } = useNavigation()

  if (!streamURL || !streamID) {
    toast.error("Falha ao inicializar o reprodutor.");
    goBack();
  };

  return (
    <VideoPlayer poster={streamThumbnail}>
      <Container className="fixed inset-0 z-60 h-dvh w-screen overflow-hidden bg-base-300 has-[&_[data-controls]:not([data-visible])]:cursor-none [&>video]:size-full [&>video]:object-contain [&>video]:bg-black">
        <Suspense fallback={null}>
          <Video
            src={streamURL}
            autoPlay={false}
            playsInline
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
            <MediaState mediaData={mediaData} />
          </PlayerRow>

          <PlayerRow bottom>
            <SeekBar mediaData={mediaData} />
            <div className="pointer-events-auto flex w-full items-center gap-2">
              <SkipButton time={-15} />
              <PlayButton />
              <SkipButton time={15} />
              <VolumeBar />
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
