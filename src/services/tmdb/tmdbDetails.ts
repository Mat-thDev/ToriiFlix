import { TMDBService, regionForLanguage, tmdbImage } from "./tmdbService";

export interface EnrichOptions {
  apiKey: string;
  language: string;
  signal?: AbortSignal;
}

const CAST_LIMIT = 6;
const RELATED_LIMIT = 12;
const BACKDROP_LIMIT = 8;

const pickProviders = (region: TMDB.WatchProviderRegion | undefined): TMDB.WatchProviderEntry[] =>
  region?.flatrate?.length ? region.flatrate
    : region?.buy?.length ? region.buy
      : region?.rent?.length ? region.rent
        : region?.ads?.length ? region.ads
          : region?.free ?? [];

const yearOf = (date?: string): string | undefined => (date ? date.slice(0, 4) : undefined);

const genreNames = (genres?: TMDB.Genre[], fallback?: string[]): string[] | undefined => {
  const names = genres?.map((g) => g.name).filter(Boolean);
  return names && names.length > 0 ? names : fallback;
};

const pickLocalized = (value: string | undefined, fallback?: string): string | undefined =>
  value && value.trim() ? value.trim() : fallback;

export const enrichMediaDetails = async (
  item: Media.Item,
  options: EnrichOptions,
): Promise<Media.Details | null> => {
  const { apiKey, language, signal } = options;
  if (!apiKey || !item.id.startsWith("tt")) return null;

  const service = new TMDBService({
    api_key: apiKey,
    language,
    region: regionForLanguage(language),
  });

  try {
    const found = await service.findByIMDB(item.id, { language, signal });
    const candidates = item.type === "movie" ? found?.movie_results : found?.tv_results;
    const match = candidates?.[0];
    if (!match) return null;

    const raw =
      item.type === "movie"
        ? await service.getMovieDetails(match.id, { language, signal })
        : await service.getTvDetails(match.id, { language, signal });
    if (!raw) return null;

    return mergeDetails(item, raw, language);
  } catch {
    // Falha do TMDB nunca quebra a tela — o Item do addon já é suficiente.
    return null;
  }
};

const mergeDetails = (
  item: Media.Item,
  raw: TMDB.DetailsResult,
  language: string,
): Media.Details => {
  const region = regionForLanguage(language);
  const isMovie = "title" in raw;
  const localizedTitle = isMovie ? raw.title : raw.name;
  const credits = raw.credits;
  const directors = credits?.crew?.filter((c) => c.job === "Director").map((c) => c.name) ?? [];
  const created = "created_by" in raw ? (raw.created_by ?? []).map((c) => c.name) : [];

  const altTitles = isMovie
    ? (raw.alternative_titles?.titles ?? [])
    : (raw.alternative_titles?.results ?? []);

  const related = (raw.recommendations?.results ?? []).slice(0, RELATED_LIMIT);

  return {
    // Base do addon + localização TMDB
    ...item,
    tmdbId: raw.id,
    name: pickLocalized(localizedTitle, item.name) as string,
    description: pickLocalized(raw.overview, item.description),
    genres: genreNames(raw.genres, item.genres),
    poster: item.poster ?? tmdbImage(raw.poster_path, "w500") ?? undefined,
    background: item.background ?? tmdbImage(raw.backdrop_path, "w1280") ?? undefined,
    year: item.year ?? yearOf(isMovie ? raw.release_date : raw.first_air_date),
    rating: item.rating ?? (raw.vote_average ? raw.vote_average.toFixed(1) : undefined),

    tagline: raw.tagline || undefined,
    runtime: (isMovie ? raw.runtime : raw.episode_run_time?.[0]) ?? undefined,
    voteAverage: raw.vote_average ?? undefined,
    originalTitle: isMovie
      ? pickLocalized(raw.original_title, undefined)
      : pickLocalized(raw.original_name, undefined),
    director: [...new Set([...directors, ...created])].join(", ") || undefined,

    cast: (credits?.cast ?? [])
      .filter((c) => c.order === undefined || c.order < CAST_LIMIT)
      .slice(0, CAST_LIMIT)
      .map((c) => ({
        name: c.name,
        character: c.character || undefined,
        profile: tmdbImage(c.profile_path, "w185") ?? undefined,
      })),

    alternativeTitles: altTitles
      .filter((t) => t.title && t.title !== localizedTitle)
      .slice(0, 12)
      .map((t) => ({ region: t.iso_3166_1, title: t.title })),

    providers: pickProviders(raw.watch_providers?.results?.[region]).map((p) => ({
      name: p.provider_name,
      logo: tmdbImage(p.logo_path, "w92") ?? undefined,
    })),

    backdrops: (raw.images?.backdrops ?? [])
      .slice(0, BACKDROP_LIMIT)
      .map((b) => tmdbImage(b.file_path, "w780"))
      .filter((url): url is string => url !== null),

    seasons: isMovie
      ? []
      : (raw.seasons ?? [])
        .filter((s) => s.season_number > 0)
        .map((s) => ({
          number: s.season_number,
          name: s.name || undefined,
          episodeCount: s.episode_count,
          airDate: s.air_date ?? undefined,
        })),
    episodeCount: "number_of_episodes" in raw ? raw.number_of_episodes : undefined,

    related: related.map((r) => ({
      tmdbId: r.id,
      type: item.type,
      name: r.title ?? r.name ?? item.name,
      poster: tmdbImage(r.poster_path, "w342") ?? undefined,
      year: yearOf(r.release_date ?? r.first_air_date),
    })),
  };
};


export const resolveImdbId = async (
  kind: Media.Kind,
  tmdbId: number,
  options: EnrichOptions,
): Promise<string | null> => {
  const { apiKey, language, signal } = options;
  if (!apiKey) return null;

  try {
    const service = new TMDBService({ api_key: apiKey, language, region: regionForLanguage(language) });
    const ids = await service.getExternalIds(kind, tmdbId, { language, signal });
    return ids?.imdb_id || null;
  } catch {
    return null;
  }
};

/** Episódios de uma temporada */
export const getSeasonEpisodes = async (
  tmdbId: number,
  seasonNumber: number,
  options: EnrichOptions,
): Promise<Media.Episode[]> => {
  const { apiKey, language, signal } = options;
  if (!apiKey) return [];

  const service = new TMDBService({ api_key: apiKey, language, region: regionForLanguage(language) });
  const season = await service.getSeason(tmdbId, seasonNumber, { language, signal });
  return (season?.episodes ?? []).map((e) => ({
    number: e.episode_number,
    name: e.name || undefined,
    overview: e.overview || undefined,
    runtime: e.runtime ?? undefined,
    still: tmdbImage(e.still_path, "w300") ?? undefined,
    airDate: e.air_date ?? undefined,
  }));
};
