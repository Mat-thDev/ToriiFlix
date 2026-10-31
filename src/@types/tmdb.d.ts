declare namespace TMDB {
  interface TMDBBaseOptions {
    api_key: string;
    language?: string;
    region?: string;
  }

  /** Opções por chamada — sobrescrevem as do construtor. */
  interface RequestOptions {
    language?: string;
    region?: string;
    signal?: AbortSignal;
  }

  /** Tamanhos do image CDN (`https://image.tmdb.org/t/p/{size}{path}`). */
  type ImageSize = "w92" | "w185" | "w300" | "w342" | "w500" | "w780" | "w1280" | "original";

  /**
   * `/find/{imdb_id}?external_source=imdb_id` — resolve id IMDb
   * para o registro TMDB (movie/tv).
   */
  interface FindResponse {
    movie_results: Title[];
    tv_results: Title[];
    person_results?: unknown[];
  }

  /** Referência de filme/série devolvida por `find` e `recommendations`. */
  interface Title {
    id: number;
    media_type?: string;
    /** Presente em filmes; ausente em séries. */
    title?: string;
    /** Presente em séries; ausente em filmes. */
    name?: string;
    overview?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
  }

  interface Genre {
    id: number;
    name: string;
  }

  interface CastMember {
    id: number;
    name: string;
    character?: string;
    profile_path?: string | null;
    /** Posição no elenco ordenado (0 = protagonista). */
    order?: number;
  }

  interface CrewMember {
    id: number;
    name: string;
    job?: string;
    department?: string;
  }

  interface Credits {
    cast: CastMember[];
    crew: CrewMember[];
  }

  /** Título alternativo (`/movie` usa `titles`, `/tv` usa `results`). */
  interface AlternativeTitle {
    iso_3166_1?: string;
    title: string;
  }

  interface PagedResults<T> {
    page?: number;
    results: T[];
    total_pages?: number;
  }

  interface ImageEntry {
    file_path: string;
    width?: number;
    height?: number;
    vote_average?: number;
  }

  interface ImagesResults {
    backdrops?: ImageEntry[];
    posters?: ImageEntry[];
  }

  interface WatchProviderEntry {
    logo_path?: string | null;
    provider_id: number;
    provider_name: string;
    priority?: number;
  }

  /** Ofertas por região: flatrate (assinatura), rent, buy, ads, free. */
  interface WatchProviderRegion {
    link?: string;
    flatrate?: WatchProviderEntry[];
    rent?: WatchProviderEntry[];
    buy?: WatchProviderEntry[];
    ads?: WatchProviderEntry[];
    free?: WatchProviderEntry[];
  }

  interface WatchProvidersResults {
    id?: number;
    results?: Record<string, WatchProviderRegion>;
  }

  interface ExternalIds {
    imdb_id?: string | null;
    tvdb_id?: number | null;
  }

  /** `/movie/{id}` (+ `append_to_response`). */
  interface MovieDetails {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    tagline?: string;
    runtime?: number | null;
    release_date?: string;
    vote_average?: number;
    poster_path?: string | null;
    backdrop_path?: string | null;
    genres?: Genre[];
    credits?: Credits;
    alternative_titles?: { id?: number; titles?: AlternativeTitle[] };
    recommendations?: PagedResults<Title>;
    watch_providers?: WatchProvidersResults;
    images?: ImagesResults;
    external_ids?: ExternalIds;
  }

  /** `/tv/{id}` (+ `append_to_response`). */
  interface TvDetails {
    id: number;
    name: string;
    original_name: string;
    overview: string;
    tagline?: string;
    /** Duração média por episódio (minutos). */
    episode_run_time?: number[];
    first_air_date?: string;
    last_air_date?: string;
    number_of_seasons?: number;
    number_of_episodes?: number;
    seasons?: SeasonSummary[];
    created_by?: { id: number; name: string }[];
    vote_average?: number;
    poster_path?: string | null;
    backdrop_path?: string | null;
    genres?: Genre[];
    credits?: Credits;
    alternative_titles?: { id?: number; results?: AlternativeTitle[] };
    recommendations?: PagedResults<Title>;
    watch_providers?: WatchProvidersResults;
    images?: ImagesResults;
    external_ids?: ExternalIds;
  }

  /** Resumo de temporada embutido no `/tv/{id}` (episódios exigem chamada própria). */
  interface SeasonSummary {
    id?: number;
    name?: string;
    season_number: number;
    episode_count?: number;
    air_date?: string | null;
    poster_path?: string | null;
  }

  interface Episode {
    id: number;
    episode_number: number;
    name?: string;
    overview?: string;
    air_date?: string | null;
    runtime?: number | null;
    still_path?: string | null;
    vote_average?: number;
  }

  /** `/tv/{id}/season/{n}`. */
  interface SeasonDetails {
    id?: number;
    name?: string;
    season_number?: number;
    episodes?: Episode[];
  }

  /** Detail (movie|tv) já mesclado com os dados do addon — contrato da UI. */
  type DetailsResult = MovieDetails | TvDetails;
}
