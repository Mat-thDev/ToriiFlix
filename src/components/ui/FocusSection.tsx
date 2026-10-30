import { useEffect } from "react";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation-react";

/** Seção focável — provedor de contexto de foco para um grupo de elementos. */
export const FocusSection = ({ children, className, focusKey, autoFocus, ...rest }: UI.FocusSectionProps) => {
  const { ref, focusKey: key, focusSelf } = useFocusable({ focusKey });

  useEffect(() => {
    if (autoFocus) focusSelf();
  }, [autoFocus, focusSelf]);

  return (
    <FocusContext.Provider value={key}>
      <div ref={ref} className={className} {...rest}>
        {children}
      </div>
    </FocusContext.Provider>
  );
};
