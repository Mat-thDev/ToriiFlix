/**
 * Contrato de mídia consumido pela UI (nunca expõe formatos brutos
 * do protocolo Stremio — ver namespace `Stremio`).
 */
declare namespace Media {
  /** Tipo de conteúdo. */
  type Kind = "movie" | "series";

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
}
