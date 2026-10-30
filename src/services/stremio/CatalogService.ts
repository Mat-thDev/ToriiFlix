import { CINEMETA } from "./builtinAddons";
import { hasResource } from "./resources";
import { getCatalog, getMeta } from "./StremioClient";

/** Fallback: só o addon embutido (quando nenhum externo é informado). */
const DEFAULT_SOURCES = [CINEMETA.baseUrl];

const isKind = (type?: string): type is Media.Kind => type === "movie" || type === "series";

/**
 * Bases dos addons que servem `catalog`: built-in + externos habilitados.
 * Passar para as opções das funções do serviço (hooks leem o atom de addons).
 */
export const catalogSources = (external: Stremio.ExternalAddon[] = []): string[] => [
  ...DEFAULT_SOURCES,
  ...external
    .filter((a) => a.enabled && hasResource(a.manifest.resources, "catalog"))
    .map((a) => a.url),
];

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
    const key = `${item.type}:${item.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
    if (items.length >= limit) break;
  }

  return items;
};

/**
 * Executa as requisições em paralelo descartando fontes que falharem
 * (addon pode não ter o catálogo pedido — ids como "top" são do Cinemeta).
 * Se todas falharem, repassa o primeiro erro.
 */
const settleOrThrow = async <T>(requests: Promise<T>[]): Promise<Awaited<T>[]> => {
  const results = await Promise.allSettled(requests);
  const fulfilled = results.filter(
    (r): r is PromiseFulfilledResult<Awaited<T>> => r.status === "fulfilled",
  );

  if (fulfilled.length === 0) {
    const rejected = results.find((r): r is PromiseRejectedResult => r.status === "rejected");
    throw rejected?.reason ?? new Error("Nenhum addon respondeu");
  }

  return fulfilled.map((r) => r.value);
};

/** Lista um catálogo em todos os addons informados (filmes ou séries). */
export const listCatalog = async (
  kind: Media.Kind,
  options: Media.CatalogOptions = {},
): Promise<Media.Page> => {
  const { list = "top", genre, limit = 20, sources = DEFAULT_SOURCES, signal } = options;

  // Extras só com o que tem valor; `limit` não é extra do protocolo
  // (paginação é `skip`) — o merge cuida do corte.
  const extra: Stremio.Extra = {};
  if (genre) extra.genre = genre;

  const responses = await settleOrThrow(
    sources.map((base) => getCatalog(base, kind, list, extra, signal)),
  );

  return { items: mergeItems(responses.map(toItems), limit) };
};

/** Detalhe de um item (movie/series) — a primeira fonte que responder meta válida vence. */
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

/**
 * Busca no extra `search` do protocolo
 * (/catalog/{type}/{top}/search=<q>.json) em todos os addons informados,
 * consultando movie + series e mergeando.
 */
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
