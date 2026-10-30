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

  /** Estado do hook `useMedia` (meta de um item). */
  interface MediaState {
    item: Media.Item | null;
    loading: boolean;
    error: string | null;
  }

  /** Estado do hook `useSearch` (itens já mapeados para o contrato da UI). */
  interface SearchState {
    items: Media.Item[];
    loading: boolean;
    error: string | null;
  }

  /** Parâmetros de leitura do hook `useCatalog` (sem signal — o hook cuida do abort). */
  type CatalogParams = Pick<Media.CatalogOptions, "list" | "genre" | "limit" | "sources">;
}
