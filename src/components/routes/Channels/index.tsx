import useCatalog from "../../../hooks/useCatalog";
import useNavigation from "../../../hooks/useNavigation";
import ChannelPlayer from "../../player/tvplayer/ChannelPlayer";
import { ErrorAlert } from "../../ui/ErrorAlert";
import { FocusButton } from "../../ui/FocusButton";


const ALL = Number.POSITIVE_INFINITY;

const ChannelsRoute = () => {
    const { page, loading, error, retry } = useCatalog("channel", { limit: ALL });
    const { goBack } = useNavigation();

    return (
        <div className="fixed inset-0 z-60 h-dvh w-screen overflow-hidden bg-base-100">
            {error ? (
                <div className="flex h-full items-center justify-center p-8">
                    <ErrorAlert
                        message={`Não foi possível carregar os canais: ${error}`}
                        onRetry={retry}
                        // Sem addon a rota não tem outro focável — sem isso o
                        // remote fica preso na tela de erro.
                        extraAction={
                            <FocusButton type="button" className="btn btn-sm btn-ghost" onClick={goBack}>
                                Voltar
                            </FocusButton>
                        }
                    />
                </div>
            ) : (
                <ChannelPlayer channels={page?.items ?? []} loading={loading} />
            )}
        </div>
    );
};

export default ChannelsRoute;
