import useHistory from "../../../hooks/useHistory";
import useNavigation from "../../../hooks/useNavigation";
import { FocusButton } from "../../ui/FocusButton";
import MediaCard from "../../ui/MediaCard";
import MediaHorizontalCard from "../../ui/MediaHorizontalCard";

const SKELETON_COUNT = 8;

const HistoryRoute = () => {

    const { history } = useHistory()
    const { navigate } = useNavigation();

    return (
        <section aria-label="Favoritos">
            <div className="mb-6 flex items-center gap-3">
                <h1>Histórico</h1>
                {history.length > 0 && (
                    <span className="badge badge-ghost font-medium">{history.length}</span>
                )}
            </div>

            {history.length === 0 && (
                <div>
                    <p className="text-base-content/60">
                        Você não tem nada no histórico! Começe a assitir agora!.
                    </p>
                    <FocusButton type="button" onClick={() => navigate("Home")} className="btn btn-outline mt-6">
                        Ir para o início
                    </FocusButton>
                </div>
            )}


            {history.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {history.map((item) => (
                        <MediaHorizontalCard
                            key={`${item.media.type}-${item.media.id}`}
                            item={item.media}
                            onSelect={(selected) => navigate("Detail", { id: selected.id, type: selected.type })}
                            watchProgress={
                                {
                                    watchedTime: item.watchedTime,
                                    duration: item.duration,
                                    watched: item.watched
                                }
                            }
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

export default HistoryRoute;