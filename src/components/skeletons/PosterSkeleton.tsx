import clsx from "clsx";

/** Caixa de pôster em carregamento (pulsante) — usada em carrossel e grade. */
export const PosterSkeleton = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={clsx("aspect-2/3 animate-pulse rounded-xl bg-base-content/10", className)}
  />
);
