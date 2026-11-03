import { hasResource } from "./resources";
import { settleOrThrow } from "./settle";
import { getSubtitles } from "./StremioClient";

export const subtitleSources = (
    external: Stremio.ExternalAddon[] = [],
    kind?: Media.Kind,
): string[] =>
    external
        .filter(
            (a) =>
                a.enabled &&
                hasResource(a.manifest.resources, "subtitles") &&
                (!kind || a.manifest.types?.some((t) => t === kind)),
        )
        .map((a) => a.url);


export const listSubtitles = async (kind: Media.Kind, id: string, options: { sources: string[], episode?: Media.EpisodeRef; signal?: AbortSignal }): Promise<Media.SubtitleTrack[]> => {
    const { sources, episode, signal } = options;
    if (sources.length === 0) return [];

    const videoId = episode ? `${id}:${episode.season}:${episode.number}` : id;

    const response = await settleOrThrow(
        sources.map(async (base) => {
            const response = await getSubtitles(base, kind, videoId, signal);

            return (response.subtitles || []).map((sub) => {
                return {
                    id: sub.id || sub.sub_id,
                    lang: sub.lang_code,
                    url: sub.url,
                    name: sub.title || "Legenda"
                }
            })
        })
    );

    return response.flat();
}


export const getSubtitleBlobUrl = async (url: string, signal?: AbortSignal): Promise<string> => {
    if (!url || url.startsWith("blob:")) return url;

    try {
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`Erro ao baixar legenda: ${response.status}`);

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Erro ao converter legenda para blob sob demanda:", error);
        return url; // Fallback para a URL original
    }
};