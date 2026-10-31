import { useFocusable } from "@noriginmedia/norigin-spatial-navigation-react";
import { useAnimations } from "../../hooks/useAppearance";

/**
 * Botão focável — primitivo de ação do app (navegação espacial remote/setas).
 * Enter dispara o clique nativo; o foco rola o elemento só o necessário
 * (scroll suave respeita o switch de animações das settings).
 */
export const FocusButton = ({
  children,
  className,
  onClick,
  onFocus,
  buttonRef,
  ...rest
}: UI.FocusButtonProps) => {
  const animations = useAnimations();
  const { ref, focused, focusSelf } = useFocusable<HTMLButtonElement>({
    onEnterPress: () => ref.current?.click(),
    onFocus: ({ node }) =>
      node?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: animations ? "smooth" : "auto",
      }),
  });

  return (
    <button
      ref={(node) => {
        ref.current = node;
        if (buttonRef) buttonRef.current = node;
      }}
      className={className}
      data-focused={focused || undefined}
      onClick={onClick}
      onFocus={(event) => {
        // Clique/Tab só move o foco DOM; sincroniza o norigin para as setas
        // partirem daqui. setFocus no próprio nó não re-dispara focus (sem loop).
        focusSelf();
        onFocus?.(event);
      }}
      {...rest}
    >
      {children}
    </button>
  );
};
