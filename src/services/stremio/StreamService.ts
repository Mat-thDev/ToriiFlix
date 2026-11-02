import { kindVariants, matchesKind } from "./kinds";
import { hasResource } from "./resources";
import { settleOrThrow } from "./settle";
import { getStreams } from "./StremioClient";

export const buildStreamId = (id: string, episode?: Media.EpisodeRef): string =>
  episode ? `${id}:${episode.season}:${episode.number}` : id;


export const streamSources = (
  external: Stremio.ExternalAddon[] = [],
  kind?: Media.Kind,
): string[] =>
  external
    .filter(
      (a) =>
        a.enabled &&
        hasResource(a.manifest.resources, "stream") &&
        (!kind || a.manifest.types?.some((t) => matchesKind(t, kind))),
    )
    .map((a) => a.url);

export const toMediaStream = (
  raw: Stremio.Stream,
  fallbackProvider: string,
): Media.Stream | null => {
  if (!raw.url && !raw.infoHash) return null;

  return {
    url: raw.url || undefined,
    infoHash: raw.infoHash || undefined,
    // Torrent só com infoHash não toca no navegador
    torrentOnly: !!raw.infoHash && !raw.url,
    provider: raw.name || fallbackProvider,
    title: raw.title || undefined,
  };
};

const streamKey = (stream: Media.Stream): string => stream.url ?? stream.infoHash ?? "";

export const listStreams = async (
  kind: Media.Kind,
  id: string,
  options: Media.StreamOptions = {},
): Promise<Media.Stream[]> => {
  const { sources = [], episode, signal } = options;
  if (sources.length === 0) return [];

  const videoId = buildStreamId(id, episode);

  // Canal: tentar os dois nomes de tipo por fonte (404 do tipo errado é
  // descartado pelo settleOrThrow e os streams são deduplicados por chave).
  const responses = await settleOrThrow(
    sources.flatMap((base) =>
      kindVariants(kind).map(async (type) => {
        const response = await getStreams(base, type, videoId, signal);
        const fallbackProvider = new URL(base).hostname;
        return (response.streams ?? [])
          .map((raw) => toMediaStream(raw, fallbackProvider))
          .filter((stream): stream is Media.Stream => stream !== null);
      }),
    ),
  );

  const seen = new Set<string>();
  const streams: Media.Stream[] = [];

  for (const batch of responses) {
    for (const stream of batch) {
      const key = streamKey(stream);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      streams.push(stream);
    }
  }

  return streams;
};
