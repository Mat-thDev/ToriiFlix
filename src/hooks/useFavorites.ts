import { useCallback } from "react";
import { useAtom } from "jotai";
import { profilesAtom } from "../atoms/profiles";

/**
 * Favoritos (lista) do perfil ativo — persiste em `profilesAtom` apenas
 * `{ id, type }` (id IMDb). Atualiza `activeProfile` e `profiles[]`
 * juntos, mesmo padrão do `editProfile`.
 */
const useFavorites = () => {
  const [profileData, setProfileData] = useAtom(profilesAtom);
  const favorites = profileData.activeProfile?.media.favorites ?? [];

  const isFavorite = useCallback(
    (id: string) => favorites.some((fav) => fav.id === id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (item: { id: string; type: Media.Kind }) => {
      setProfileData((prev) => {
        if (!prev.activeProfile) return prev;

        const list = prev.activeProfile.media.favorites;
        const exists = list.some((fav) => fav.id === item.id);
        const next = exists
          ? list.filter((fav) => fav.id !== item.id)
          : [...list, { id: item.id, type: item.type }];

        const activeProfile = {
          ...prev.activeProfile,
          media: { ...prev.activeProfile.media, favorites: next },
        };

        return {
          activeProfile,
          profiles: prev.profiles.map((p) => (p.id === activeProfile.id ? activeProfile : p)),
        };
      });
    },
    [setProfileData],
  );

  return { favorites, isFavorite, toggleFavorite };
};

export default useFavorites;
