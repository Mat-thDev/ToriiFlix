import { useEffect } from "react";
import { Gesture, Hotkey } from "@videojs/react";

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
import PlayerSurface from "./PlayerSurface";


const ToriiPlayer = () => {
  const { settings } = useSettings()
  const { currentPage, currentProps, goBack } = useNavigation();

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
    <PlayerSurface
      key={id}
      src={stream.url}
      backgroundImage={media.item.background}
      autoPlay={settings.playback.autoPlay}
      className="fixed inset-0 z-60 h-dvh w-screen has-[&_[data-controls]:not([data-visible])]:cursor-none"
    >
      <MediaController playbackSettings={settings.playback} streamConfig={streamConfig} />
      <PlayerControls>
        <PlayerRow top>
          <BackButton onClick={goBack} />
          <MediaState mediaData={media} />
        </PlayerRow>

        <PlayerRow bottom>
          <SeekBar />
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

    </PlayerSurface>
  )
};

export default ToriiPlayer;
