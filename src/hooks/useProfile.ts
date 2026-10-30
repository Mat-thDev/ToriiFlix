import { useCallback } from "react";
import { useAtom } from "jotai";
import { profilesAtom, profileSwitcherAtom } from "../atoms/profiles";

/** Id curto — evita crypto.randomUUID, indisponível em contexto não seguro (webOS). */
const createProfileId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** Edição de perfil: apenas campos editáveis (id e media ficam fora do patch). */
type ProfilePatch = Partial<Pick<Users.Profile, "display_name" | "profile_picture" | "background">>;

/**
 * Perfis (persistidos em localStorage) + seletor em runtime.
 * `activeProfile === null` mantém o gate WhosWatching na tela.
 */
const useProfile = () => {
  const [profileData, setProfileData] = useAtom(profilesAtom);
  const [switcherOpen, setSwitcherOpen] = useAtom(profileSwitcherAtom);

  const activeProfile = profileData.activeProfile;
  const profilesAvaliable = profileData.profiles;

  /** Seleciona o perfil ativo — sai do gate ou conclui a troca. */
  const changeProfile = useCallback(
    (newProfile: Users.Profile) => {
      setProfileData((prev) => ({ ...prev, activeProfile: newProfile }));
    },
    [setProfileData],
  );

  const createProfile = useCallback(
    (draft: { display_name: string; profile_picture?: string; background?: string }) => {
      const newProfile: Users.Profile = {
        id: createProfileId(),
        display_name: draft.display_name.trim(),
        profile_picture: draft.profile_picture ?? "",
        background: draft.background ?? "",
        media: { favorites: [] },
      };

      setProfileData((prev) => ({ ...prev, profiles: [...prev.profiles, newProfile] }));
    },
    [setProfileData],
  );

  /** Edita perfil pela id; o perfil ativo recebe o mesmo patch (mesma fonte). */
  const editProfile = useCallback(
    (id: string, patch: ProfilePatch) => {
      setProfileData((prev) => ({
        profiles: prev.profiles.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        activeProfile: prev.activeProfile?.id === id ? { ...prev.activeProfile, ...patch } : prev.activeProfile,
      }));
    },
    [setProfileData],
  );

  /** Remove perfil; excluir o ativo volta o app ao gate. */
  const removeProfile = useCallback(
    (id: string) => {
      const removingActive = activeProfile?.id === id;

      setProfileData((prev) => ({
        profiles: prev.profiles.filter((item) => item.id !== id),
        activeProfile: prev.activeProfile?.id === id ? null : prev.activeProfile,
      }));

      if (removingActive) setSwitcherOpen(false);
    },
    [activeProfile, setProfileData, setSwitcherOpen],
  );

  const openSwitcher = useCallback(() => setSwitcherOpen(true), [setSwitcherOpen]);
  const closeSwitcher = useCallback(() => setSwitcherOpen(false), [setSwitcherOpen]);

  return {
    activeProfile,
    profilesAvaliable,
    switcherOpen,
    changeProfile,
    createProfile,
    editProfile,
    removeProfile,
    openSwitcher,
    closeSwitcher,
  };
};


export default useProfile;
