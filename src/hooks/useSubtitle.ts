
import { useEffect, useState } from "react";

import { subtitleSources } from "../services/stremio/SubtitleService";
import { useAtomValue } from "jotai";
import { addonsAtom } from "../atoms/addons";
import { getSubtitles } from "../services/stremio/StremioClient";

export const useSubtitles = (kind?: Media.Kind, id?: string, episode?: Media.EpisodeRef) => {
    const addons = useAtomValue(addonsAtom);
    const [subtitles, setSubtitles] = useState<Media.SubtitleTrack[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchSubtitlesList() {

            if (!kind || !id) return [];

            try {
                setLoading(true);
                const sources = subtitleSources(addons, kind);
                const videoId = episode ? `${id}:${episode.season}:${episode.number}` : id;

                // Busca apenas o JSON de legendas de cada fonte (sem baixar os arquivos .vtt)
                const promises = sources.map(async (base) => {
                    const response = await getSubtitles(base, kind, videoId, controller.signal);
                    return (response.subtitles || []).map((sub) => ({
                        id: sub.id || sub.url,
                        lang: sub.lang || "pt",
                        url: sub.url, // URL direta do addon
                        name: sub.lang ? `${sub.lang.toUpperCase()} - ${sub.id || "Legenda"}` : "Legenda",
                    }));
                });

                const results = await Promise.allSettled(promises);
                const allTracks: Media.SubtitleTrack[] = [];

                for (const result of results) {
                    if (result.status === "fulfilled") {
                        allTracks.push(...result.value);
                    }
                }

                if (!controller.signal.aborted) {
                    setSubtitles(allTracks);
                }
            } catch (error) {
                if (error instanceof Error && (error.name === "AbortError" || error.message.includes("aborted"))) {
                    return;
                }
                console.error("Erro ao carregar lista de legendas:", error);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchSubtitlesList();

        return () => {
            controller.abort();
        };
    }, [kind, id, episode, addons]);

    return { subtitles, loading };
};