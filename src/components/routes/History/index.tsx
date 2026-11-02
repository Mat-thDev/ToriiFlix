import useHistory from "../../../hooks/useHistory";
import useNavigation from "../../../hooks/useNavigation";
import useModals from "../../../hooks/useModals";
import { FocusButton } from "../../ui/FocusButton";
import MediaHorizontalCard from "../../ui/MediaHorizontalCard";

/** Chave estável da entrada: id + episódio (séries têm uma por episódio). */
const entryKey = (entry: Media.MediaHistory) =>
    entry.episode
        ? `${entry.id}-s${entry.episode.season}e${entry.episode.number}`
        : String(entry.id);

const HistoryRoute = () => {

    const { history } = useHistory()
    const { navigate } = useNavigation();
    const { showModal } = useModals();

    // Clique retoma: abre o seletor de fontes do item/episódio certo
    // (o player restaura a posição salva daquele episódio).
    const resume = (entry: Media.MediaHistory) => {
        if (entry.media.type === "series" && !entry.episode) {
            // entrada legada sem episódio — não dá pra retomar
            navigate("Detail", { id: entry.media.id, type: entry.media.type });
            return;
        }

        showModal("StreamSelector", {
            type: entry.media.type,
            id: entry.media.id,
            item: entry.media,
            episode: entry.episode,
        });
    };

    return (
        <section aria-label="Histórico">
            <div className="mb-6 flex items-center gap-3">
                <h1>Histórico</h1>
                {history.length > 0 && (
                    <span className="badge badge-ghost font-medium">{history.length}</span>
                )}
            </div>

            {history.length === 0 && (
                <div>
                    <p className="text-base-content/60">
                        Você não tem nada no histórico! Comece a assistir agora.
                    </p>
                    <FocusButton type="button" onClick={() => navigate("Home")} className="btn btn-outline mt-6">
                        Ir para o início
                    </FocusButton>
                </div>
            )}


            {history.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {history.map((entry) => (
                        <MediaHorizontalCard
                            key={entryKey(entry)}
                            item={entry.media}
                            subtitle={
                                entry.episode
                                    ? `T${entry.episode.season} · E${entry.episode.number}${entry.episode.name ? ` — ${entry.episode.name}` : ""}`
                                    : undefined
                            }
                            onSelect={() => resume(entry)}
                            watchProgress={
                                {
                                    watchedTime: entry.watchedTime,
                                    duration: entry.duration,
                                    watched: entry.watched
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
