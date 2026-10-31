import { hasResource } from "./resources";
import { settleOrThrow } from "./settle";
import { getStreams } from "./StremioClient";

/** Bases dos addons que servem `stream`: externos habilitados (sem seed built-in). */
export const streamSources = (external: Stremio.ExternalAddon[] = []): string[] =>
  external
    .filter((a) => a.enabled && hasResource(a.manifest.resources, "stream"))
    .map((a) => a.url);


export const toMediaStream = (
  raw: Stremio.Stream,
  fallbackProvider: string,
): Media.Stream | null => {
  if (!raw.url && !raw.infoHash) return null;

  return {
    url: raw.url || undefined,
    infoHash: raw.infoHash || undefined,
    // Torrent só com infoHash não toca no navegador (DOSSIE pitfall #13)
    torrentOnly: !!raw.infoHash && !raw.url,
    // No protocolo `name` costuma ser o nome do addon (ex.: "Torrentio")
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
  const { sources = [], signal } = options;
  if (sources.length === 0) return [];

  const responses = await settleOrThrow(
    sources.map(async (base) => {
      const response = await getStreams(base, kind, id, signal);
      const fallbackProvider = new URL(base).hostname;
      return (response.streams ?? [])
        .map((raw) => toMediaStream(raw, fallbackProvider))
        .filter((stream): stream is Media.Stream => stream !== null);
    }),
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
