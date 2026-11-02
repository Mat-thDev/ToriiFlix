import { useState, useRef, useCallback, useEffect } from "react";

const AUTO_HIDE_MS = 4_000;

export const useAutoHide = (delay = AUTO_HIDE_MS) => {
    const [visible, setVisible] = useState(true);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const poke = useCallback(() => {
        setVisible(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setVisible(false), delay);
    }, [delay]);

    useEffect(() => {
        poke();
        return () => clearTimeout(timer.current);
    }, [poke]);

    return { visible, poke };
};