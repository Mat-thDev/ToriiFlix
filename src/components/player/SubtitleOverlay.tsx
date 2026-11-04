import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@videojs/react/video";
import useSettings from "../../hooks/useSettings";
import { SUBTITLE_BACKGROUND, SUBTITLE_FONT, SUBTITLE_SIZE } from "../../utils/subtitle";

/** Remove markup dos cues VTT (<i>, <c.class>, timestamps) e marcações ASS. */
const stripTags = (text: string) =>
    text.replace(/<[^>]+>/g, "").replace(/\{\\[^}]*\}/g, "").trim();

/**
 * Legenda renderizada pelo app em vez do display nativo do Chromium.
 *
 * O display nativo mora na shadow-root do <video>: fica atrás do gradiente
 * dos controles (acinzentada) e some junto com o autohide — o Chromium o
 * reposiciona/esvazia sem que nosso CSS ou JS toque nele. Aqui lemos as cues
 * ativas da track com mode "showing" (a mesma que o menu de legendas controla,
 * então o menu continua funcionando) e desenhamos numa div própria, acima do
 * gradiente e abaixo dos botões. O nativo é escondido no App.css.
 */
const SubtitleOverlay = () => {
    const store = usePlayer();
    const storeRef = useRef(store);
    storeRef.current = store;

    const { settings } = useSettings();
    const [text, setText] = useState("");

    useEffect(() => {
        let detach: (() => void) | undefined;
        let interval: ReturnType<typeof setInterval> | undefined;

        const setup = () => {
            if (detach) return;

            const video = storeRef.current.target?.media as HTMLVideoElement | undefined;
            if (!video?.textTracks) return;

            const tracks = video.textTracks;
            let active: TextTrack | null = null;

            const render = () => {
                const cues = active?.activeCues;
                if (!cues || cues.length === 0) {
                    setText("");
                    return;
                }

                let out = "";
                for (let i = 0; i < cues.length; i++) {
                    const line = stripTags((cues[i] as VTTCue).text ?? "");
                    if (line) out += (out ? "\n" : "") + line;
                }
                setText(out);
            };

            const sync = () => {
                let showing: TextTrack | null = null;
                for (let i = 0; i < tracks.length; i++) {
                    const track = tracks[i];
                    if (
                        (track.kind === "captions" || track.kind === "subtitles") &&
                        track.mode === "showing"
                    ) {
                        showing = track;
                        break;
                    }
                }

                if (showing !== active) {
                    active?.removeEventListener("cuechange", render);
                    active = showing;
                    active?.addEventListener("cuechange", render);
                }
                render();
            };

            tracks.addEventListener("change", sync);
            tracks.addEventListener("addtrack", sync);
            tracks.addEventListener("removetrack", sync);
            sync();

            detach = () => {
                tracks.removeEventListener("change", sync);
                tracks.removeEventListener("addtrack", sync);
                tracks.removeEventListener("removetrack", sync);
                active?.removeEventListener("cuechange", render);
            };

            if (interval !== undefined) {
                clearInterval(interval);
                interval = undefined;
            }
        };

        // O player pode montar o <video> depois do primeiro render (Suspense)
        setup();
        if (!detach) interval = setInterval(setup, 250);

        return () => {
            if (interval !== undefined) clearInterval(interval);
            detach?.();
        };
    }, []);

    if (!text) return null;

    const { subtitleSize, subtitleFont, subtitleBackground } = settings.playback;

    return (
        <div className="pointer-events-none absolute inset-x-0 bottom-[3.5%] z-1 text-center">
            <span
                className="inline-block max-w-[85%] whitespace-pre-line px-1.5 py-0.5 font-medium leading-snug"
                style={{
                    color: "#ffffff",
                    fontFamily: SUBTITLE_FONT[subtitleFont],
                    fontSize: SUBTITLE_SIZE[subtitleSize],
                    backgroundColor: SUBTITLE_BACKGROUND[subtitleBackground],
                    borderRadius: "var(--radius-field, 4px)",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
                }}
            >
                {text}
            </span>
        </div>
    );
};

export default SubtitleOverlay;
