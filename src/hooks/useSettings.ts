import { useCallback } from "react";
import { useAtom } from "jotai";
import { settingsAtom } from "../atoms/settings";

/**
 * Configurações do app (persistidas em localStorage).
 * `changeSetting` mescla o patch na seção, imutavelmente, ex.:
 *   changeSetting("appearance", { theme: "torii-ink" })
 */
const useSettings = () => {
  const [settings, setSettings] = useAtom(settingsAtom);

  const changeSetting = useCallback(
    <S extends AppSettings.Section>(section: S, patch: Partial<AppSettings.Settings[S]>) => {
      setSettings((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));
    },
    [setSettings],
  );

  return { settings, changeSetting };
};

export default useSettings;
