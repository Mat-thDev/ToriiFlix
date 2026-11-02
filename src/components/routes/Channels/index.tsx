import useCatalog from "../../../hooks/useCatalog";
import ChannelPlayer from "../../player/tvplayer/ChannelPlayer";
import { ErrorAlert } from "../../ui/ErrorAlert";


const ALL = Number.POSITIVE_INFINITY;

const ChannelsRoute = () => {
    const { page, loading, error, retry } = useCatalog("channel", { limit: ALL });

    return (
        <div className="fixed inset-0 z-60 h-dvh w-screen overflow-hidden bg-base-100">
            {error ? (
                <div className="flex h-full items-center justify-center p-8">
                    <ErrorAlert
                        message={`Não foi possível carregar os canais: ${error}`}
                        onRetry={retry}
                    />
                </div>
            ) : (
                <ChannelPlayer channels={page?.items ?? []} loading={loading} />
            )}
        </div>
    );
};

export default ChannelsRoute;
