import { useEffect } from "react";
import { usePlayer } from "@videojs/react/video";
import { isTypingTarget } from "../../platform/input";

interface PlayerKeyHandlerProps {
    /** "watch": setas = seek/volume. "channels": setas do remote (rail/volume). */
    mode: "watch" | "channels";
    /** Reexibe a UI ao usar uma tecla tratada (hoje só o watch usa; channels não — acordar o rail é papel de onRailOpen). */
    onActivity?: () => void;
    /** channels: OK/dir com o foco em body abre o rail (foca o canal atual). */
    onRailOpen?: () => void;
    /** channels: esquerda dentro da lista fecha o rail (sem acordar a UI). */
    onRailClose?: () => void;
}

/**
 * Teclado do remote no player. Vive dentro do VideoPlayer (usa o store) e intercepta
 * em fase de captura na window: com o alvo em body/html (caso TV — os controles não são
 * focusables), norigin (bubble na window) e os hotkeys do videojs (bubble no container)
 * nunca recebem a tecla, então não há duplo-handling nem salto de foco para a sidebar.
 * Foco dentro do container (desktop) → passa adiante e o videojs cuida normalmente.
 *
 * O norigin faz preventDefault em TODA tecla do keymap (mesmo sem mover foco), então
 * toda decisão de "cortar" tem que acontecer aqui, antes dele, em capture.
 */
const PlayerKeyHandler = ({ mode, onActivity, onRailOpen, onRailClose }: PlayerKeyHandlerProps) => {
    const store = usePlayer();

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const target = e.target;
            const tag = target instanceof HTMLElement ? target.tagName : "";

            if (document.querySelector("dialog[open]")) return; // modal aberto: norigin navega o modal
            if (isTypingTarget(target)) return;
            if (e.defaultPrevented) return;

            if (mode === "watch") {
                if (tag !== "BODY" && tag !== "HTML") return; // desktop: deixa o videojs tratar

                let handled = true;
                switch (e.key) {
                    case "ArrowRight":
                        store.seek(store.currentTime + 10);
                        break;
                    case "ArrowLeft":
                        store.seek(store.currentTime - 10);
                        break;
                    case "ArrowUp":
                        store.setVolume(store.volume + 0.1);
                        break;
                    case "ArrowDown":
                        store.setVolume(store.volume - 0.1);
                        break;
                    case " ":
                    case "Enter":
                        if (e.repeat) return; // segurar a tecla não alterna pause em loop
                        if (store.paused) void store.play();
                        else store.pause();
                        break;
                    default:
                        handled = false;
                }

                if (!handled) return;
                e.preventDefault();
                e.stopPropagation(); // corta o norigin (bubble na window)
                store.toggleControls(true);
                onActivity?.();
                return;
            }

            // ---- channels ----
            const active = document.activeElement;
            const railEl = document.querySelector("[data-channel-rail]");
            const inRail = !!railEl?.contains(active);
            const inChips = !!railEl?.querySelector("[data-chip-row]")?.contains(active);
            const body = tag === "BODY" || tag === "HTML";

            if (inRail && !inChips && e.key === "ArrowLeft") {
                // Fecha o rail sem acordar controles nem o próprio rail:
                // blur devolve o foco pra body, de onde OK/dir reabre.
                e.preventDefault();
                e.stopPropagation();
                onRailClose?.();
                return;
            }

            if (!body) return; // foco no rail (norigin) ou em botão do container (videojs)

            switch (e.key) {
                case "ArrowRight":
                case "Enter":
                    onRailOpen?.(); // OK/dir: abre o rail e foca no canal atual
                    break;
                case "ArrowUp":
                    store.setVolume(store.volume + 0.1);
                    break;
                case "ArrowDown":
                    store.setVolume(store.volume - 0.1);
                    break;
                case "ArrowLeft":
                    break; // corta o norigin (o foco interno pode estar defasado após blur)
                case " ":
                    if (e.repeat) return;
                    if (store.paused) void store.play();
                    else store.pause();
                    break;
                case "m":
                case "M":
                    store.setMuted(!store.muted);
                    break;
                default:
                    return; // outras teclas: deixa passar
            }

            e.preventDefault();
            e.stopPropagation();
            store.toggleControls(true);
            // Sem onActivity aqui: volume/pause no body não podem acordar o rail —
            // ele só abre por onRailOpen (OK/dir ou botão "Canais").
        };

        window.addEventListener("keydown", onKeyDown, true);
        return () => window.removeEventListener("keydown", onKeyDown, true);
    }, [store, mode, onActivity, onRailOpen, onRailClose]);

    return null;
};

export default PlayerKeyHandler;
