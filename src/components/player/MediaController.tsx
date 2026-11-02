import { usePlayer } from "@videojs/react/video";
import { useEffect, useRef } from "react";
import useHistory from "../../hooks/useHistory";

/** Identidade do restore: uma posição por id + episódio (séries). */
const resumeKey = (id: string | number, episode?: Media.EpisodeRef) =>
    episode ? `${id}:${episode.season}:${episode.number}` : String(id);

const MediaController = ({
    playbackSettings,
    streamConfig
}: {
    playbackSettings: AppSettings.Playback;
    streamConfig: Player.StreamConfig;
}) => {
    const store = usePlayer();

    const { upsertHistory, fetchHistory } = useHistory();

    const restoredMedia = useRef<string | null>(null);
    const markedWatched = useRef(false);
    const episode = streamConfig.episode;
    const key = resumeKey(streamConfig.id, episode);

    // Retorna de onde parou (por episódio em séries, por id em filmes)
    useEffect(() => {
        if (!streamConfig.id || !store.target) return;

        if (restoredMedia.current === key) return;

        const data = fetchHistory(streamConfig.id, episode);

        restoredMedia.current = key;

        if (!data) return;
        if (data.watched) return;

        const watchedTime = Number(data.watchedTime);

        if (Number.isFinite(watchedTime) && watchedTime > 0) {
            store.seek(watchedTime);
        }

    }, [key, streamConfig.id, episode, store, fetchHistory]);

    // Salva o histórico
    useEffect(() => {
        if (!playbackSettings.saveHistory) return;
        if (!streamConfig.id) return;

        markedWatched.current = false;

        const interval = setInterval(() => {
            const currentTime = store.currentTime;
            const duration = store.duration;

            if (markedWatched.current) return;
            if (currentTime <= 0) return;

            // Marca assistido ao chegar no fim (não descarta o último save)
            const watched = duration > 0 && currentTime >= duration;

            const data: Media.MediaHistory = {
                id: streamConfig.id,
                media: streamConfig.media.item,
                episode,
                watchedTime: currentTime,
                duration,
                watched,
                timestamp: new Date().toISOString()
            };

            upsertHistory(data);
            // fim: para de atualizar p/ não reordenar a lista por timestamp
            if (watched) markedWatched.current = true;
        }, 3000);

        return () => clearInterval(interval);

    }, [
        playbackSettings.saveHistory,
        streamConfig.id,
        streamConfig.media.item,
        episode,
        upsertHistory
    ]);

    return null;
};

export default MediaController;
