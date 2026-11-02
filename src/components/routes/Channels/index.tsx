import useCatalog from "../../../hooks/useCatalog";
import ChannelPlayer from "../../player/ChannelPlayer";

const ChannelsRoute = () => {

    const { page } = useCatalog("channel")

    if (!page) return;

    return (
        <div className="fixed inset-0 z-60 h-dvh w-screen overflow-hidden bg-base-100">
            <ChannelPlayer channels={page.items} />
        </div>
    )
}

export default ChannelsRoute;