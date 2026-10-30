/**
 * Skeleton do hero — mesma geometria do Hero renderizado
 * (imagem + scrims + bloco de texto + ações).
 */
export const HeroSkeleton = () => (
  <section
    aria-label="Carregando"
    aria-busy="true"
    className="relative -mx-8 -mt-6 h-(--hero-height) min-h-105 overflow-hidden"
  >
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[radial-gradient(120%_80%_at_30%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_60%)]"
    />

    <div className="absolute right-0 bottom-0 left-0 px-8 pb-10">
      <div className="h-4 w-28 animate-pulse rounded bg-base-content/10" />
      <div className="mt-4 h-14 w-2/5 max-w-xl animate-pulse rounded bg-base-content/10" />
      <div className="mt-4 h-4 w-72 animate-pulse rounded bg-base-content/10" />
      <div className="mt-6 flex gap-3">
        <div className="h-12 w-40 animate-pulse rounded-btn bg-base-content/10" />
        <div className="h-12 w-48 animate-pulse rounded-btn bg-base-content/10" />
      </div>
    </div>
  </section>
);
