import { Film, Star } from "lucide-react";
import { FocusButton } from "./FocusButton";

/** Largura do pôster — compartilhada com o skeleton do carrossel. */
export const POSTER_WIDTH = "w-40 md:w-44 lg:w-48";

/**
 * Card de pôster das linhas de catálogo (estilo Netflix/Crunchyroll).
 * `<button>` para ser alcançável pela navegação espacial (remote/setas).
 */
const MediaCard = ({ item, onSelect }: UI.MediaCardProps) => (
  <FocusButton
    type="button"
    onClick={() => onSelect?.(item)}
    aria-label={`${item.name}${item.year ? ` (${item.year})` : ""}`}
    className={`group block shrink-0 p-2 text-left ${POSTER_WIDTH}`}
  >
    <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-base-200 ring-1 ring-base-content/10 transition-shadow duration-200 group-hover:ring-2 group-hover:ring-primary group-data-focused:ring-2 group-data-focused:ring-primary">
      {item.poster ? (
        <img
          src={item.poster}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center bg-[radial-gradient(120%_80%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_14%,transparent),transparent_65%)]"
        >
          <Film className="size-8 text-base-content/25" />
        </div>
      )}

      {item.rating && (
        <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-base-100/85 px-2 py-0.5 text-xs font-bold text-warning backdrop-blur-sm">
          <Star className="size-3 fill-current" aria-hidden="true" />
          {item.rating}
        </span>
      )}
    </div>

    <p className="mt-2 line-clamp-2 text-sm leading-snug font-semibold">{item.name}</p>

    {item.year && <p className="mt-0.5 text-xs text-base-content/55">{item.year}</p>}
  </FocusButton>
);

export default MediaCard;
