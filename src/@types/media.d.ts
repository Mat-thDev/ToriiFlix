/**
 * Contrato de mídia consumido pela UI (nunca expõe formatos brutos
 * do protocolo Stremio — ver namespace `Stremio`).
 */
declare namespace Media {
  /** Tipo de conteúdo. */
  type Kind = "movie" | "series" | "tv" | "channel";

  /** Item de catálogo/detalhe já mapeado. */
  interface Item {
    id: string;
    type: Kind;
    name: string;
    poster?: string;
    background?: string;
    year?: string;
    description?: string;
    genres?: string[];
    /** IMDb rating, ex.: "7.5" */
    rating?: string;
  }

  /** Elenco exibido no detalhe (top N do TMDB). */
  interface CastMember {
    name: string;
    character?: string;
    /** URL do retrato (w185). */
    profile?: string;
  }

  /** Título alternativo do TMDB (região + título). */
  interface AlternativeTitle {
    /** Sigla ISO 3166-1, ex.: "BR". */
    region?: string;
    title: string;
  }

  /** Provedor de streaming da região do usuário (watch/providers). */
  interface WatchProvider {
    name: string;
    /** URL do logo (w92). */
    logo?: string;
  }

  /** Temporada de série (resumo — episódios ficam em `EpisodesState`). */
  interface Season {
    number: number;
    name?: string;
    episodeCount?: number;
    airDate?: string;
  }

  /** Episódio (carregado sob demanda ao escolher a temporada). */
  interface Episode {
    number: number;
    name?: string;
    overview?: string;
    runtime?: number;
    still?: string;
    airDate?: string;
  }

  /**
   * Stream já mapeado (agregado de todos os addons com recurso `stream`).
   * Pelo menos um de `url`/`infoHash` presente; ranking fica na camada de player.
   */
  interface Stream {
    /** URL direta — presente em streams não-torrent. */
    url?: string;
    /** Hash do torrent (quando não há URL direta). */
    infoHash?: string;
    /** Torrent sem URL direta: não toca no navegador — exibir estado "torrent-only". */
    torrentOnly: boolean;
    /** Nome do addon que serviu o stream (ex.: "Torrentio"). */
    provider: string;
    /** Título/linha do stream no formato do addon (qualidade, idioma, tamanho...). */
    title?: string;
  }

  /**
   * Título relacionado (recommendations do TMDB) — id é do TMDB,
   * não do addon; resolver para IMDb antes de navegar (ver `resolveImdbId`).
   */
  interface Related {
    tmdbId: number;
    type: Kind;
    name: string;
    poster?: string;
    year?: string;
  }

  /**
   * Detalhe enriquecido: `Item` do addon + TMDB no idioma das settings.
   * Título/sinopse/gêneros vêm localizados do TMDB (fallback: addon).
   */
  interface Details extends Item {
    /** Id do registro TMDB — base p/ temporadas e relacionados. */
    tmdbId: number;
    tagline?: string;
    /** Duração em minutos (filme) ou por episódio (série). */
    runtime?: number;
    /** Nota TMDB (0–10). */
    voteAverage?: number;
    /** Título original (quando difere do localizado). */
    originalTitle?: string;
    director?: string;
    cast: CastMember[];
    alternativeTitles: AlternativeTitle[];
    /** Onde assistir — provedores da região (preferindo assinatura, senão aluguel ou compra). */
    providers: WatchProvider[];
    /** Backdrops em resolução média (w780). */
    backdrops: string[];
    /** Séries: resumos das temporadas (episódios sob demanda). */
    seasons: Season[];
    /** Séries: total de episódios. */
    episodeCount?: number;
    related: Related[];
  }

  /** Página de catálogo. */
  interface Page {
    items: Item[];
  }

  /** Catálogos disponíveis no addon Cinemeta (verificado em v3-cinemeta). */
  type CatalogList = "top" | "featured" | "imdbRating" | "year";

  /** Opções de leitura de catálogo (service + hook). */
  interface CatalogOptions {
    /** Id do catálogo no addon — curados do Cinemeta: "top" | "featured" | "imdbRating" | "year"; addons externos usam os próprios ids do manifest. */
    list?: string;
    /** Filtro do extra `genre` do addon (ex.: "Action"; no catálogo `year`, o ano ex.: "2026"). */
    genre?: string;
    limit?: number;
    /** Bases dos addons consultados (ver `catalogSources`); default: todos os habilitados com `catalog`. */
    sources?: string[];
    /**
     * Addons externos com manifest — usado para resolver o id do catálogo
     * (`manifest.catalogs`) quando `list` é omitido. Sem `list` e sem
     * `external`, cai no fallback "top".
     */
    external?: Stremio.ExternalAddon[];
    signal?: AbortSignal;
  }

  /** Opções de leitura de meta de um item. */
  interface MetaOptions {
    sources?: string[];
    signal?: AbortSignal;
  }

  /** Opções de busca no catálogo (extra `search` do protocolo). */
  interface SearchOptions {
    limit?: number;
    sources?: string[];
    signal?: AbortSignal;
  }

  interface EpisodeRef {
    season: number;
    number: number;
    /** Nome do episódio — apenas exibição (histórico/UI), não usado nas requests. */
    name?: string;
  }

  /** Opções de leitura de streams de um item. */
  interface StreamOptions {
    /** Bases dos addons consultados (ver `streamSources`); default: nenhum (nenhum built-in serve stream). */
    sources?: string[];
    episode?: EpisodeRef;
    signal?: AbortSignal;
  }

  /** Seção exclusiva de um addon — derivada dos `manifest.catalogs`. */
  interface ExternalSection {
    /** `${addonId}:${type}:${id}` — estável p/ key e dedupe entre addons. */
    key: string;
    title: string;
    addonName: string;
    baseUrl: string;
    kind: Kind;
    list: string;
  }


  interface MediaHistory {
    id: string | number;
    media: Media.Item;
    /** Presente quando a entrada é de um episódio (séries) — uma entrada por episódio. */
    episode?: Media.EpisodeRef;
    watchedTime: number;
    duration: number;
    watched: boolean
    timestamp: string;
  }

  interface ChannelCatalogGroup {
    addonId: string;
    addonName: string;
    baseUrl: string;
    catalogId: string;
    catalogName: string;
    genres?: string[];
  }
}
