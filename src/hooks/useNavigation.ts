import { useCallback } from "react";
import { useAtom } from "jotai";
import { navigationAtom } from "../atoms/navigation";

const MAX_STACK = 15;

const useNavigation = () => {
  const [navigation, setNavigation] = useAtom(navigationAtom);

  /** Navega para uma página, empilhando a atual no histórico. */
  const navigate = useCallback(
    <P extends Nav.Page>(page: P, props?: Nav.PageProps[P]) => {
      setNavigation((prev) => {
        const curr = prev.current;

        // Impede ir para a mesma página com as mesmas props
        if (curr.page === page && curr.props === props) return prev;

        const newStack = [...prev.stack, curr];
        const stack = newStack.length > MAX_STACK ? newStack.slice(-MAX_STACK) : newStack;

        return { current: { page, props }, stack };
      });
    },
    [setNavigation],
  );

  /** Volta para a página anterior (no-op no início do histórico). */
  const goBack = useCallback(() => {
    setNavigation((prev) => {
      if (prev.stack.length === 0) return prev;

      return {
        current: prev.stack[prev.stack.length - 1],
        stack: prev.stack.slice(0, -1),
      };
    });
  }, [setNavigation]);

  return {
    currentPage: navigation.current.page,
    currentProps: navigation.current.props,
    navigate,
    goBack,
  };
};

export default useNavigation;
