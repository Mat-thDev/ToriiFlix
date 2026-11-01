import useNavigation from "../../../hooks/useNavigation";
import ToriiPlayer from "../../player";

const WatchRoute = () => {

  const { currentProps } = useNavigation()
  const { streamURL, streamID, streamThumbnail, mediaData } = currentProps as Player.StreamConfig;

  return (
    <section>
      <ToriiPlayer streamURL={streamURL} streamThumbnail={streamThumbnail} streamID={streamID} mediaData={mediaData} />
    </section>
  )
}


export default WatchRoute;