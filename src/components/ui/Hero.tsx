import { Film, Sparkles, Star } from "lucide-react";
import { FocusSection } from "./FocusSection";
import { FavoriteButton } from "./FavoriteButton";
import { formatRuntime } from "../../utils/format";

/**
 * Hero de destaque/detalhe — imagem full-bleed com scrims de legibilidade,
 * eyebrow, título, meta e ações. Gradientes usam tokens do tema (color-mix).
 * Com `details` (TMDB) ganha tagline, duração e nota TMDB na linha de meta.
 */
export const Hero = ({ item, details, eyebrow = "Destaque", actions }: UI.HeroProps) => (
  <FocusSection
    aria-label={item.name}
    className="relative -mx-8 -mt-6 h-(--hero-height) min-h-105 overflow-hidden"
  >
    {item.background ? (
      <img
        src={item.background}
        alt=""
        loading="eager"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
    ) : (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_80%_at_30%_0%,color-mix(in_oklab,var(--color-primary)_14%,transparent),transparent_65%)]"
      />
    )}

    {/* Scrim lateral — legibilidade do texto à esquerda */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-base-300)_0%,color-mix(in_oklab,var(--color-base-300)_78%,transparent)_38%,transparent_72%)]"
    />
    {/* Fade superior — funde ao topbar */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-base-300)_0%,color-mix(in_oklab,var(--color-base-300)_15%,transparent)_20%,transparent_62%)]"
    />
    {/* Fade inferior — funde o hero no conteúdo abaixo */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--color-base-300)_0%,color-mix(in_oklab,var(--color-base-300)_65%,transparent)_30%,transparent_62%)]"
    />

    {!item.background && (
      <Film
        aria-hidden="true"
        className="absolute top-1/2 right-16 size-24 -translate-y-1/2 text-base-content/10"
      />
    )}

    <div className="absolute right-0 bottom-0 left-0 px-8 pb-10">
      <p className="flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-primary uppercase">
        <Sparkles className="size-4" aria-hidden="true" />
        {eyebrow}
      </p>

      <h1 className="mt-3 line-clamp-2 max-w-3xl text-[clamp(2.25rem,4.5vw,4rem)]">
        {item.name}
      </h1>

      {details?.tagline && (
        <p className="mt-2 max-w-2xl text-sm text-base-content/55 italic">{details.tagline}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/75">
        {item.year && <span>{item.year}</span>}
        {formatRuntime(details?.runtime) && <span>{formatRuntime(details?.runtime)}</span>}
        {item.genres && <span>{item.genres.slice(0, 3).join(" · ")}</span>}
        {item.rating && (
          <span className="flex items-center gap-1 font-semibold text-warning">
            <Star className="size-4 fill-current" aria-hidden="true" />
            {item.rating}
          </span>
        )}
        {details?.voteAverage !== undefined && (
          <span className="flex items-center gap-1 font-semibold text-primary">
            <Star className="size-4 fill-current" aria-hidden="true" />
            TMDB {details.voteAverage.toFixed(1)}
          </span>
        )}
      </div>

      {item.description && (
        <p className="mt-4 line-clamp-2 max-w-2xl text-sm text-base-content/70 md:text-base">
          {item.description}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {actions}
        <FavoriteButton item={item} label className="btn btn-outline gap-2" />
      </div>
    </div>
  </FocusSection>
);
