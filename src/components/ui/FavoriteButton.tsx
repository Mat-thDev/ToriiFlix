import { Bookmark, BookmarkCheck } from "lucide-react";
import clsx from "clsx";
import { FocusButton } from "./FocusButton";
import useFavorites from "../../hooks/useFavorites";

/**
 * Botão de favoritar (lista do perfil) — usado no Hero e nos cards.
 * Salva só o id IMDb + tipo no perfil ativo (useFavorites).
 */
export const FavoriteButton = ({ item, label, className }: UI.FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(item.id);

  return (
    <FocusButton
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remover ${item.name} da lista` : `Adicionar ${item.name} à lista`}
      title={saved ? "Remover da lista" : "Adicionar à lista"}
      onClick={() => toggleFavorite(item)}
      className={clsx(className, saved && "text-primary")}
    >
      {saved ? (
        <BookmarkCheck className="size-4 fill-current" aria-hidden="true" />
      ) : (
        <Bookmark className="size-4" aria-hidden="true" />
      )}
      {label && <span className="text-sm font-semibold">{saved ? "Na lista" : "Lista"}</span>}
    </FocusButton>
  );
};

export default FavoriteButton;
