import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation-react";
import { init } from "@noriginmedia/norigin-spatial-navigation-core";
import { settingsAtom } from "./atoms/settings";
import { applyPlatformClass } from "./platform";
import useBackNavigation from "./hooks/useBackNavigation";
import useEditableFocus from "./hooks/useEditableFocus";
import { TMDBService } from "./services/tmdb/tmdbService";

init({
  debug: false,
  visualDebug: false,
  shouldFocusDOMNode: true,
  useGetBoundingClientRect: true,
});

const Provider = ({ children }: UI.ProviderProps) => {
  const { ref, focusKey, focusSelf } = useFocusable();
  const theme = useAtomValue(settingsAtom).appearance.theme;
  const apiKey = useAtomValue(settingsAtom).addons.tmdbApiKey;

  useEffect(() => {
    applyPlatformClass();
  }, []);

  useEffect(() => {
    focusSelf();
  }, [focusSelf]);

  useBackNavigation();
  useEditableFocus();


  const TMDB = new TMDBService({ api_key: apiKey ?? "", language: "pt-BR" });
  const findData = TMDB.findByIMDB("tt28014327")
  console.log(findData, apiKey);

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref} data-theme={theme} className="h-full bg-base-300 text-base-content">
        {children}
      </div>
    </FocusContext.Provider>
  );
};

export default Provider;
