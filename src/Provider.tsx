import { useEffect } from "react";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation-react";
import { init } from "@noriginmedia/norigin-spatial-navigation-core";
import { MotionConfig } from "framer-motion";
import useAppearance from "./hooks/useAppearance";
import { applyPlatformClass } from "./platform";
import useBackNavigation from "./hooks/useBackNavigation";
import useEditableFocus from "./hooks/useEditableFocus";

init({
  debug: false,
  visualDebug: false,
  shouldFocusDOMNode: true,
  useGetBoundingClientRect: true,
});

const Provider = ({ children }: UI.ProviderProps) => {
  const { ref, focusKey, focusSelf } = useFocusable();
  const { theme, animations } = useAppearance();

  useEffect(() => {
    applyPlatformClass();
  }, []);

  // Marca o switch de animações no <html> (CSS corta transições/keyframes)
  useEffect(() => {
    document.documentElement.dataset.animations = animations ? "on" : "off";
  }, [animations]);

  useEffect(() => {
    focusSelf();
  }, [focusSelf]);

  useBackNavigation();
  useEditableFocus();

  return (
    <FocusContext.Provider value={focusKey}>
      {/* reducedMotion "always" (switch off) desliga transforms do framer-motion */}
      <MotionConfig reducedMotion={animations ? "user" : "always"}>
        <div ref={ref} data-theme={theme} className="h-full bg-base-300 text-base-content">
          {children}
        </div>
      </MotionConfig>
    </FocusContext.Provider>
  );
};

export default Provider;
