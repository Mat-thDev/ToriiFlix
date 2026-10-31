/**
 * Tipagens dos estados de hook (loading/erro/retry).
 * Uso: `UI.CatalogState`, `UI.MediaState`, ...
 */
declare namespace Hooks {
  /** Estado do hook `useCatalog`. */
  interface CatalogState {
    page: Media.Page | null;
    loading: boolean;
    error: string | null;
  }

  /** Estado do hook `useMedia` (meta do addon + enriquecimento TMDB). */
  interface MediaState {
    item: Media.Item | null;
    loading: boolean;
    error: string | null;
    /** Detalhes TMDB (null enquanto carrega ou sem API key/falha). */
    details: Media.Details | null;
    /** Segunda fase do carregamento — a tela já mostrou o Item do addon. */
    detailsLoading: boolean;
  }

  /** Estado do hook `useSearch` (itens já mapeados para o contrato da UI). */
  interface SearchState {
    items: Media.Item[];
    loading: boolean;
    error: string | null;
  }

  /** Estado do hook `useSeason` (episódios de uma temporada, lazy). */
  interface SeasonState {
    episodes: Media.Episode[];
    loading: boolean;
    error: string | null;
  }

  /** Parâmetros de leitura do hook `useCatalog` (sem signal — o hook cuida do abort). */
  type CatalogParams = Pick<Media.CatalogOptions, "list" | "genre" | "limit" | "sources">;
}
