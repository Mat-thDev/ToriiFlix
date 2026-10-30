import { useEffect, useRef } from "react";
import useNavigation from "./useNavigation";
import { isBackEvent } from "../platform/input";

/** Escuta global de "voltar" (Esc/Backspace/tecla 461 do remote webOS). */
const useBackNavigation = () => {
  const { goBack } = useNavigation();
  const goBackRef = useRef(goBack);

  useEffect(() => {
    goBackRef.current = goBack;
  }, [goBack]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || !isBackEvent(e)) return;
      e.preventDefault(); // Backspace sem isso volta a página do browser
      goBackRef.current();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
};

export default useBackNavigation;
