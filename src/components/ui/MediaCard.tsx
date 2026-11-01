import { useId, useState } from "react";
import { Film, Star } from "lucide-react";
import { SpatialNavigation } from "@noriginmedia/norigin-spatial-navigation-core";
import { FocusButton } from "./FocusButton";
import { FavoriteButton } from "./FavoriteButton";
import { usePosterWidth } from "../../hooks/useAppearance";


const MediaCard = ({ item, onSelect }: UI.MediaCardProps) => {
  const posterWidth = usePosterWidth();
  const uid = useId().replace(/:/g, "");
  const cardFocusKey = `media-card-${uid}`;
  const favFocusKey = `media-fav-${uid}`;
  const [cardFocused, setCardFocused] = useState(false);

  return (
    <div className={`group/card relative shrink-0 p-2 ${posterWidth}`}>
      <FocusButton
        type="button"
        data-focus="inner"
        focusKey={cardFocusKey}
        onArrowPress={(direction) => {
          if (direction === "down") {
            SpatialNavigation.setFocus(favFocusKey);
            return false;
          }
        }}
        onFocus={() => setCardFocused(true)}
        onBlur={() => setCardFocused(false)}
        onClick={() => onSelect?.(item)}
        aria-label={`${item.name}${item.year ? ` (${item.year})` : ""}`}
        className="group block w-full text-left"
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

      <FavoriteButton
        item={item}
        variant="overlay"
        reveal={cardFocused}
        focusKey={favFocusKey}
        onArrowPress={(direction) => {
          if (direction === "up") {
            SpatialNavigation.setFocus(cardFocusKey);
            return false;
          }
        }}
        className="absolute top-4 left-4 z-10"
      />
    </div>
  );
};

export default MediaCard;
