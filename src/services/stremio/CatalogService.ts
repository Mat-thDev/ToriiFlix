import { CINEMETA } from "./builtinAddons";
import { isChannelLike, kindVariants, matchesKind } from "./kinds";
import { hasResource } from "./resources";
import { settleOrThrow } from "./settle";
import { getCatalog, getMeta } from "./StremioClient";

const DEFAULT_SOURCES = [CINEMETA.baseUrl];

const KINDS: readonly string[] = ["movie", "series", "channel", "tv"];

const isKind = (type?: string): type is Media.Kind => !!type && KINDS.includes(type);

export const catalogSources = (
  external: Stremio.ExternalAddon[] = [],
  kind?: Media.Kind,
): string[] => {
  // Cinemeta não serve catálogo de canal — builtin só nos kinds de filme/série
  const builtin = !kind || !isChannelLike(kind) ? DEFAULT_SOURCES : [];

  const addons = external
    .filter(
      (a) =>
        a.enabled &&
        hasResource(a.manifest.resources, "catalog") &&
        (!kind || a.manifest.catalogs?.some((c) => matchesKind(c.type, kind))),
    )
    .map((a) => a.url);

  return [...builtin, ...addons];
};

/** Bruto (Stremio) -> contrato da UI (Media). Inválido retorna null. */
export const toMediaItem = (raw: Stremio.Meta): Media.Item | null => {
  const id = raw._id || raw.id;
  if (!isKind(raw.type) || !id || !raw.name) return null;

  const year = raw.releaseInfo ?? raw.year;

  return {
    id,
    type: raw.type,
    name: raw.name,
    poster: raw.poster || undefined,
    background: raw.background || undefined,
    year: year !== undefined && year !== "" ? String(year) : undefined,
    description: raw.description || undefined,
    genres: raw.genres && raw.genres.length > 0 ? raw.genres : undefined,
    rating: raw.imdbRating || undefined,
  };
};

const toItems = (response: Stremio.CatalogResponse): Media.Item[] =>
  (response.metas ?? [])
    .map(toMediaItem)
    .filter((item): item is Media.Item => item !== null);

/** Mergeia itens de várias fontes sem repetição (type:id), cortando no limite. */
const mergeItems = (batches: Media.Item[][], limit: number): Media.Item[] => {
  const seen = new Set<string>();
  const items: Media.Item[] = [];

  for (const item of batches.flat()) {
    // Canal deduplica por id: o mesmo canal pode chegar como "channel:x" e "tv:x"
    const key = isChannelLike(item.type) ? `channel:${item.id}` : `${item.type}:${item.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
    if (items.length >= limit) break;
  }

  return items;
};

/** Lista um catálogo em todos os addons informados (filmes ou séries). */
export const listCatalog = async (
  kind: Media.Kind,
  options: Media.CatalogOptions = {},
): Promise<Media.Page> => {
  const { list = "top", genre, limit = 20, sources = DEFAULT_SOURCES, signal } = options;

  const extra: Stremio.Extra = {};
  if (genre) extra.genre = genre;

  // Canal: pedir os dois nomes de tipo por fonte (addon declara "channel" ou "tv");
  // o 404 do tipo errado é descartado pelo settleOrThrow.
  const responses = await settleOrThrow(
    sources.flatMap((base) =>
      kindVariants(kind).map((type) => getCatalog(base, type, list, extra, signal)),
    ),
  );

  return { items: mergeItems(responses.map(toItems), limit) };
};

/** Detalhe de um item (movie/series). */
export const getMedia = async (
  kind: Media.Kind,
  id: string,
  options: Media.MetaOptions = {},
): Promise<Media.Item | null> => {
  const { sources = DEFAULT_SOURCES, signal } = options;

  const responses = await settleOrThrow(sources.map((base) => getMeta(base, kind, id, signal)));

  for (const response of responses) {
    const item = toMediaItem(response.meta);
    if (item) return item;
  }

  return null;
};

export const searchCatalog = async (
  query: string,
  options: Media.SearchOptions = {},
): Promise<Media.Page> => {
  const { limit = 20, sources = DEFAULT_SOURCES, signal } = options;
  const extra: Stremio.Extra = { search: query };

  const responses = await settleOrThrow(
    sources.flatMap((base) => [
      getCatalog(base, "movie", "top", extra, signal),
      getCatalog(base, "series", "top", extra, signal),
    ]),
  );

  // Cinemeta pode devolver o mesmo titulo com sufixos/ids diferentes — dedupe por título
  const seen = new Set<string>();
  const items: Media.Item[] = [];

  for (const item of responses.flatMap(toItems)) {
    const key = `${item.type}:${item.name.toLowerCase()}`;
    if (seen.has(key)) continue;

    seen.add(key);
    items.push(item);
    if (items.length >= limit) break;
  }

  return { items };
};
