import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation-react";
import { init } from "@noriginmedia/norigin-spatial-navigation-core";
import { settingsAtom } from "./atoms/settings";
import { applyPlatformClass } from "./platform";
import useBackNavigation from "./hooks/useBackNavigation";

init({
  debug: false,
  visualDebug: false,
  shouldFocusDOMNode: true,
  useGetBoundingClientRect: true,
});

const Provider = ({ children }: UI.ProviderProps) => {
  const { ref, focusKey, focusSelf } = useFocusable();
  const theme = useAtomValue(settingsAtom).appearance.theme;

  useEffect(() => {
    applyPlatformClass();
  }, []);

  useEffect(() => {
    focusSelf();
  }, [focusSelf]);

  useBackNavigation();

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref} data-theme={theme} className="h-full bg-base-300 text-base-content">
        {children}
      </div>
    </FocusContext.Provider>
  );
};

export default Provider;
