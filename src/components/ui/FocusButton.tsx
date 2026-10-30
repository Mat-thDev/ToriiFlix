import { useFocusable } from "@noriginmedia/norigin-spatial-navigation-react";

/**
 * Botão focável — primitivo de ação do app (navegação espacial remote/setas).
 * Enter dispara o clique nativo; o foco rola o elemento só o necessário.
 */
export const FocusButton = ({ children, className, onClick, buttonRef, ...rest }: UI.FocusButtonProps) => {
  const { ref, focused } = useFocusable<HTMLButtonElement>({
    onEnterPress: () => ref.current?.click(),
    onFocus: ({ node }) => node?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" }),
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
      {...rest}
    >
      {children}
    </button>
  );
};
