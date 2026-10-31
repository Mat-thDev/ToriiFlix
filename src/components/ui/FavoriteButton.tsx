import { Bookmark, BookmarkCheck } from "lucide-react";
import clsx from "clsx";
import { FocusButton } from "./FocusButton";
import useFavorites from "../../hooks/useFavorites";

/**
 * Botão de favoritar (lista do perfil) — usado no Hero e nos cards.
 * Salva só o id IMDb + tipo no perfil ativo (useFavorites).
 * Variante `overlay`: circular, dentro do pôster do MediaCard —
 * revela no hover do mouse, no foco do remote ou quando já está salvo.
 * O pop do ícone é um keyframe CSS (App.css) que respeita o switch de animações.
 */
export const FavoriteButton = ({
  item,
  label,
  className,
  variant,
  reveal,
  focusKey,
  onArrowPress,
}: UI.FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(item.id);
  const overlay = variant === "overlay";

  return (
    <FocusButton
      type="button"
      focusKey={focusKey}
      onArrowPress={onArrowPress}
      aria-pressed={saved}
      aria-label={saved ? `Remover ${item.name} da lista` : `Adicionar ${item.name} à lista`}
      title={saved ? "Remover da lista" : "Adicionar à lista"}
      onClick={() => toggleFavorite(item)}
      className={clsx(
        className,
        saved && "text-primary",
        overlay && [
          "grid size-8 place-items-center rounded-full transition-all duration-200 active:scale-90",
          "bg-base-100/80 text-base-content/70 ring-1 ring-base-content/10 backdrop-blur-sm hover:text-primary",
          saved && "bg-primary/15 ring-primary/30",
          !saved && !reveal && "opacity-0 group-hover/card:opacity-100 data-focused:opacity-100",
        ],
      )}
    >
      <span key={String(saved)} className={overlay ? "animate-[fav-pop_0.3s_ease-out]" : undefined}>
        {saved ? (
          <BookmarkCheck className="size-4 fill-current" aria-hidden="true" />
        ) : (
          <Bookmark className="size-4" aria-hidden="true" />
        )}
      </span>
      {label && <span className="text-sm font-semibold">{saved ? "Na lista" : "Lista"}</span>}
    </FocusButton>
  );
};

export default FavoriteButton;
