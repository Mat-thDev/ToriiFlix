import { useState, useRef, useCallback, useEffect } from "react";

const AUTO_HIDE_MS = 4_000;

export const useAutoHide = (delay = AUTO_HIDE_MS) => {
    // Oculto por padrão: o rail do Channels só aparece por ação explícita
    // (OK/Dir ou botão "Canais"), nunca por mouse/tecla solta.
    const [visible, setVisible] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const poke = useCallback(() => {
        setVisible(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setVisible(false), delay);
    }, [delay]);

    /** Esconde já (cancela o timer) — usado pelo fechamento do rail com seta esquerda. */
    const hide = useCallback(() => {
        clearTimeout(timer.current);
        setVisible(false);
    }, []);

    useEffect(() => () => clearTimeout(timer.current), []);

    return { visible, poke, hide };
};