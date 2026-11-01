import { usePlayer } from "@videojs/react/video";
import { useEffect, useRef } from "react";
import useHistory from "../../hooks/useHistory";

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

    // Retorna de onde parou
    useEffect(() => {
        if (!streamConfig.id || !store.target) return;

        if (restoredMedia.current === String(streamConfig.id)) return;

        const data = fetchHistory(streamConfig.id);

        if (!data) {
            restoredMedia.current = String(streamConfig.id);
            return;
        }

        restoredMedia.current = String(streamConfig.id);

        if (data.watched) return;

        const watchedTime = Number(data.watchedTime);

        if (Number.isFinite(watchedTime) && watchedTime > 0) {
            store.seek(watchedTime);
        }

    }, [streamConfig.id, store, fetchHistory]);

    // Salva o histórico
    useEffect(() => {
        if (!playbackSettings.saveHistory) return;
        if (!streamConfig.id) return;

        const interval = setInterval(() => {
            const currentTime = store.currentTime;
            const duration = store.duration;

            if (currentTime <= 0 || duration > 0 && currentTime >= duration) return;

            const data: Media.MediaHistory = {
                id: streamConfig.id,
                media: streamConfig.media.item,
                watchedTime: currentTime,
                duration,
                watched: duration > 0 && currentTime >= duration,
                timestamp: new Date().toISOString()
            };

            upsertHistory(data);
        }, 3000);

        return () => clearInterval(interval);

    }, [
        playbackSettings.saveHistory,
        streamConfig.id,
        streamConfig.media.item,
        upsertHistory
    ]);

    return null;
};

export default MediaController;