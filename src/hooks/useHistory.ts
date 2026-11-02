import { useCallback } from "react";
import { useAtom } from "jotai";
import { historyAtom } from "../atoms/history";

/**
 * Entradas são distintas por id + episódio: filmes/direto têm uma entrada
 * por id; séries têm uma entrada por episódio (evita E2 sobrescrever E1).
 */
const sameEntry = (item: Media.MediaHistory, id: string | number, episode?: Media.EpisodeRef) =>
    item.id === id &&
    (item.episode?.season ?? -1) === (episode?.season ?? -1) &&
    (item.episode?.number ?? -1) === (episode?.number ?? -1);

const useHistory = () => {
    const [history, setHistory] = useAtom(historyAtom);

    const upsertHistory = useCallback((newData: Media.MediaHistory) => {
        setHistory((prev) => {
            const exists = prev.some((item) => sameEntry(item, newData.id, newData.episode));

            if (exists) {
                return prev.map((item) =>
                    sameEntry(item, newData.id, newData.episode)
                        ? { ...item, ...newData }
                        : item
                );
            }

            return [...prev, newData];
        });
    }, [setHistory]);

    const fetchHistory = useCallback(
        (id: string | number, episode?: Media.EpisodeRef) =>
            history.find((i) => sameEntry(i, id, episode)),
        [history],
    );

    const removeHistory = useCallback(
        (id: string | number, episode?: Media.EpisodeRef) => {
            setHistory((prev) => prev.filter((item) => !sameEntry(item, id, episode)));
        },
        [setHistory],
    );

    const clearHistory = useCallback(() => setHistory([]), [setHistory]);

    return {
        // cópia — nunca ordenar o array do atom in-place
        history: [...history].sort(
            (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp),
        ),
        upsertHistory,
        fetchHistory,
        removeHistory,
        clearHistory,
    };
};

export default useHistory;
