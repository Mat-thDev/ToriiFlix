/**
 * Skeleton das seções de detalhe — pulsos sutis enquanto o TMDB
 * enriquece o Item do addon (não esconde o hero já renderizado).
 */
export const DetailsSkeleton = () => (
  <div aria-label="Carregando detalhes" aria-busy="true" className="space-y-3">
    <div className="h-5 w-40 animate-pulse rounded bg-base-content/10" />
    <div className="h-4 w-2/3 max-w-2xl animate-pulse rounded bg-base-content/10" />
    <div className="h-4 w-1/2 max-w-xl animate-pulse rounded bg-base-content/10" />
  </div>
);
