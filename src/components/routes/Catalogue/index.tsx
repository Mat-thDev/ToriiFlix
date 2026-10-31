import { useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { addonsAtom } from "../../../atoms/addons";
import useFavorites from "../../../hooks/useFavorites";
import useNavigation from "../../../hooks/useNavigation";
import { usePosterWidth } from "../../../hooks/useAppearance";
import { catalogSources, getMedia } from "../../../services/stremio/CatalogService";
import MediaCard from "../../ui/MediaCard";
import { FocusButton } from "../../ui/FocusButton";
import { ErrorAlert } from "../../ui/ErrorAlert";
import { PosterSkeleton } from "../../skeletons/PosterSkeleton";

const SKELETON_COUNT = 8;

/**
 * Favoritos/Lista do perfil ativo — resolve a meta de cada id IMDb salvo
 * nos addons habilitados e exibe em grade. Sem favoritos: estado vazio.
 */
const CatalogueRoute = () => {
  const { favorites } = useFavorites();
  const addons = useAtomValue(addonsAtom);
  const sources = useMemo(() => catalogSources(addons), [addons]);
  const posterWidth = usePosterWidth();
  const { navigate } = useNavigation();

  const [items, setItems] = useState<Media.Item[]>([]);
  const [loading, setLoading] = useState(favorites.length > 0);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (favorites.length === 0) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    // Meta por id IMDb em paralelo — falha de um item não derruba a lista
    Promise.all(
      favorites.map((fav) =>
        getMedia(fav.type, fav.id, { sources, signal: controller.signal }).catch(() => null),
      ),
    )
      .then((results) => {
        if (controller.signal.aborted) return;
        const found = results.filter((item): item is Media.Item => item !== null);
        setItems(found);
        setLoading(false);
        if (found.length === 0) setError("Nenhum addon respondeu com esses títulos");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
        setError("Não foi possível carregar sua lista");
      });

    return () => controller.abort();
  }, [favorites, sources, attempt]);

  const retry = () => setAttempt((n) => n + 1);

  return (
    <section aria-label="Favoritos">
      <div className="mb-6 flex items-center gap-3">
        <h1>Favoritos</h1>
        {favorites.length > 0 && (
          <span className="badge badge-ghost font-medium">{favorites.length}</span>
        )}
      </div>

      {loading && (
        <div aria-busy="true" className="flex flex-wrap gap-4">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <div key={i} className={`${posterWidth} shrink-0 p-2`}>
              <PosterSkeleton />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-base-content/10" />
              <div className="mt-1 h-3 w-1/3 animate-pulse rounded bg-base-content/10" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <ErrorAlert message={`Não foi possível carregar sua lista: ${error}`} onRetry={retry} />
      )}

      {!loading && !error && favorites.length === 0 && (
        <div>
          <p className="text-base-content/60">
            Sua lista está vazia — use o botão de favoritar em um título para adicioná-lo aqui.
          </p>
          <FocusButton type="button" onClick={() => navigate("Home")} className="btn btn-outline mt-6">
            Ir para o início
          </FocusButton>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <MediaCard
              key={`${item.type}-${item.id}`}
              item={item}
              onSelect={(selected) => navigate("Detail", { id: selected.id, type: selected.type })}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CatalogueRoute;
