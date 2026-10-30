/**
 * Formatos brutos do Stremio Addon Protocol (JSON sobre HTTP).
 * Todos os campos opcionais: addons de terceiros podem omitir qualquer um.
 * Valores reais conferidos em https://v3-cinemeta.strem.io (2026-10).
 */
declare namespace Stremio {
  /** `meta` de catálogo (`metas[]`) ou detalhe (`meta`). */
  interface Meta {
    /** Id no protocolo; no catálogo da Cinemeta vem vazio — usar `id` como fallback. */
    _id?: string;
    id?: string;
    type?: string;
    name?: string;
    poster?: string;
    background?: string;
    logo?: string;
    description?: string;
    /** Ano; Cinemeta envia string ou número. */
    releaseInfo?: string | number;
    /** Presente no detalhe (`meta`), ausente no catálogo. */
    year?: string | number;
    genres?: string[];
    imdbRating?: string;
    slug?: string;
  }

  interface CatalogResponse {
    metas: Meta[];
    cacheMaxAge?: number;
    expires?: string;
  }

  interface MetaResponse {
    meta: Meta;
  }

  /** `streams` de um item (`/stream/{type}/{id}.json`). */
  interface StreamResponse {
    streams: Stream[];
  }

  /** Stream de um addon — campos principais do protocolo (ranking fica na camada de player). */
  interface Stream {
    url?: string;
    name?: string;
    title?: string;
    behaviorHints?: Record<string, unknown>;
  }

  interface Manifest {
    id: string;
    name: string;
    logo?: string;
    version: string;
    resources: string[] | { name: string; type?: string[] }[];
    types: string[];
    catalogs: { type: string; id: string; name?: string }[];
    idPrefixes?: string[];
    behaviorHints?: Record<string, unknown>;
  }

  /** Query string do endpoint `({extra})` do protocolo. */
  type Extra = Record<string, string | number>;

  /** Recursos que um addon pode servir. */
  type AddonResource = "manifest" | "catalog" | "meta" | "stream" | "subtitles";

  /** Addon embutido (seed). */
  interface BuiltinAddon {
    id: string;
    name: string;
    baseUrl: string;
    resources: AddonResource[];
  }

  /** Addon externo instalado pelo usuário. */
  interface ExternalAddon {
    url: string;
    manifest: Manifest;
    enabled: boolean;
  }
}
