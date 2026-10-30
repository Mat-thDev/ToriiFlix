import { useEffect } from "react";
import { useFocusable, FocusContext } from "@noriginmedia/norigin-spatial-navigation-react";

/** Seção focável — provedor de contexto de foco para um grupo de elementos. */
export const FocusSection = ({ children, className, focusKey, autoFocus, isFocusBoundary, ...rest }: UI.FocusSectionProps) => {
  const { ref, focusKey: key, focusSelf, focused, hasFocusedChild } = useFocusable({
    focusKey,
    isFocusBoundary,
  });

  useEffect(() => {
    if (autoFocus) focusSelf();
  }, [autoFocus, focusSelf]);

  return (
    <FocusContext.Provider value={key}>
      <div
        ref={ref}
        data-focus-section=""
        data-focused={focused || undefined}
        data-has-focused-child={hasFocusedChild || undefined}
        className={className}
        {...rest}
      >
        {children}
      </div>
    </FocusContext.Provider>
  );
};
