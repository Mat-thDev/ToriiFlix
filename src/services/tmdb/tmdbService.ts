
/**
 * Cliente HTTP da API TMDB v3 — leitura tipada (namespace `TMDB`).
 * - Idioma/região por chamada (default vem do construtor; a UI passa o
 *   `settings.system.language` para localizar título/sinopse/gêneros).
 * - Retry com backoff (429/5xx/timeout/rede), cache em memória por
 *   endpoint+idioma e suporte a `AbortSignal`.
 */
const IMAGE_BASE = "https://image.tmdb.org/t/p";

/** TTL do cache em memória (dados de detalhe mudam devagar). */
const CACHE_TTL_MS = 5 * 60_000;

interface CacheEntry {
  expires: number;
  data: unknown;
}

interface FetchOptions {
  endpoint: string;
  params?: Record<string, string>;
  retries?: number;
  timeoutMs?: number;
  /** Sinal do consumidor (unmount do hook) — cancela sem retry. */
  signal?: AbortSignal;
}

/** Região TMDB a partir do idioma da interface (pt-BR→BR, en→US, es→ES). */
export const regionForLanguage = (language?: string): string => {
  const base = (language ?? "pt-BR").split("-")[0]?.toLowerCase();
  if (base === "pt") return "BR";
  if (base === "es") return "ES";
  return "US";
};

/** URL absoluta de uma imagem do TMDB (`path` começa com "/"). */
export const tmdbImage = (path?: string | null, size: TMDB.ImageSize = "w500"): string | null =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;

export class TMDBService {
  private BASE_URI = "https://api.themoviedb.org/3";
  private API_KEY = "";
  private LANGUAGE = "pt-BR";
  private REGION = "BR";

  /** Cache por `${endpoint}|${language}|${region}` (compartilhado entre instâncias). */
  private static cache = new Map<string, CacheEntry>();

  constructor({ api_key, language, region }: TMDB.TMDBBaseOptions) {
    this.API_KEY = api_key;
    this.LANGUAGE = language ?? "pt-BR";
    this.REGION = region ?? regionForLanguage(language);
  }

  /** Resolve um id IMDb para o registro TMDB (movie ou tv). */
  async findByIMDB(
    imdbId: string,
    options: TMDB.RequestOptions = {},
  ): Promise<TMDB.FindResponse | null> {
    if (!imdbId) return null;
    return this.fetchData<TMDB.FindResponse>({
      endpoint: `/find/${imdbId}`,
      params: { external_source: "imdb_id" },
      signal: options.signal,
      ...this.requestExtras(options),
    });
  }

  /**
   * Detalhe de filme com tudo anexado numa única chamada
   * (credits, images, alternative_titles, recommendations, watch_providers).
   */
  async getMovieDetails(
    tmdbId: number,
    options: TMDB.RequestOptions = {},
  ): Promise<TMDB.MovieDetails | null> {
    return this.fetchData<TMDB.MovieDetails>({
      endpoint: `/movie/${tmdbId}`,
      params: { append_to_response: "credits,images,alternative_titles,recommendations,watch_providers" },
      signal: options.signal,
      ...this.requestExtras(options),
    });
  }

  /** Detalhe de série com tudo anexado numa única chamada. */
  async getTvDetails(
    tmdbId: number,
    options: TMDB.RequestOptions = {},
  ): Promise<TMDB.TvDetails | null> {
    return this.fetchData<TMDB.TvDetails>({
      endpoint: `/tv/${tmdbId}`,
      params: { append_to_response: "credits,images,alternative_titles,recommendations,watch_providers" },
      signal: options.signal,
      ...this.requestExtras(options),
    });
  }

  /** Episódios de uma temporada (`/tv/{id}/season/{n}`) — chamada lazy. */
  async getSeason(
    tmdbId: number,
    seasonNumber: number,
    options: TMDB.RequestOptions = {},
  ): Promise<TMDB.SeasonDetails | null> {
    return this.fetchData<TMDB.SeasonDetails>({
      endpoint: `/tv/${tmdbId}/season/${seasonNumber}`,
      signal: options.signal,
      ...this.requestExtras(options),
    });
  }

  /** External ids de um registro TMDB (usado p/ converter relacionados em IMDb). */
  async getExternalIds(
    kind: Media.Kind,
    tmdbId: number,
    options: TMDB.RequestOptions = {},
  ): Promise<TMDB.ExternalIds | null> {
    return this.fetchData<TMDB.ExternalIds>({
      endpoint: `/${kind === "movie" ? "movie" : "tv"}/${tmdbId}/external_ids`,
      signal: options.signal,
      ...this.requestExtras(options),
    });
  }

  /** Idioma/região da chamada: opção > construtor. */
  private requestExtras(options: TMDB.RequestOptions): { language?: string; region?: string } {
    return {
      ...(options.language ? { language: options.language } : { language: this.LANGUAGE }),
      ...(options.region ? { region: options.region } : { region: this.REGION }),
    };
  }

  private async fetchData<T>({
    endpoint,
    params = {},
    retries = 3,
    timeoutMs = 8000,
    signal,
    language,
    region,
  }: FetchOptions & { language?: string; region?: string }): Promise<T | null> {
    if (!this.API_KEY) return null;

    const lang = language ?? this.LANGUAGE;
    const reg = region ?? this.REGION;

    // `region` não entra na query (endpoints de detalhe não a aceitam);
    // serve p/ chave de cache e p/ filtrar watch/providers no mapeador.
    const query = new URLSearchParams({ api_key: this.API_KEY, language: lang });
    for (const [key, value] of Object.entries(params)) {
      query.set(key, value);
    }

    const cacheKey = `${endpoint}|${lang}|${reg}|${JSON.stringify(params)}`;
    const cached = TMDBService.cache.get(cacheKey);
    if (cached) {
      if (cached.expires > Date.now()) return cached.data as T;
      TMDBService.cache.delete(cacheKey);
    }

    const finalUri = `${this.BASE_URI}${endpoint}?${query.toString()}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      // Cancelamento do consumidor (unmount): aborta sem retry
      if (signal?.aborted) throw new DOMException("Abortado", "AbortError");

      const timeoutCtl = AbortSignal.timeout(timeoutMs);
      const combined = signal ? AbortSignal.any([signal, timeoutCtl]) : timeoutCtl;

      try {
        const res = await fetch(finalUri, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${this.API_KEY}`,
          },
          signal: combined,
        });

        if (res.ok) {
          const data = (await res.json()) as T;
          TMDBService.cache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, data });
          return data;
        }

        const text = await res.text().catch(() => "");
        const retryable = res.status === 429 || (res.status >= 500 && res.status < 600);

        if (retryable && attempt < retries) {
          const retryAfter = res.headers.get("retry-after");
          const backoff = retryAfter ? Number(retryAfter) * 1000 : 300 * Math.pow(2, attempt) + Math.random() * 100;
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }

        throw new Error(`TMDB fetch failed ${res.status} ${endpoint}: ${text}`);
      } catch (e: any) {
        // Abort vindo do consumidor não deve repetir
        if (signal?.aborted) throw e;

        const isAbort = e.name === "AbortError" || e.name === "TimeoutError";
        const isNetwork = e.cause?.code === "ECONNRESET" || String(e.message).includes("fetch failed");
        if ((isAbort || isNetwork) && attempt < retries) {
          await new Promise((r) => setTimeout(r, 300 * Math.pow(2, attempt)));
          continue;
        }
        throw e;
      }
    }

    return null;
  }
}
