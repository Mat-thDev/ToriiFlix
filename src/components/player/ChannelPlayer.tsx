import { useEffect, useState } from "react";
import { Hotkey } from "@videojs/react";
import { TvMinimalPlay } from "lucide-react";
import PlayerSurface from "./PlayerSurface";
import ChannelRail from "./ChannelRail";
import { useAutoHide } from "../../hooks/useAutoHide";
import useChannelStream from "../../hooks/useChannelStream";


const ChannelPlayer = ({ channels }: { channels: Media.Item[] }) => {
    const [selectedId, setSelectedId] = useState<string>();
    const activeId = selectedId ?? channels[0]?.id;
    // Tipo real do canal ativo ("channel" ou "tv") — a stream deve usar o
    // mesmo tipo que o addon declarou no catálogo.
    const activeKind = channels.find((c) => c.id === activeId)?.type ?? "channel";

    const { visible, poke } = useAutoHide();
    const { stream, unavailable, retry } = useChannelStream(activeId, activeKind);

    useEffect(() => {
        window.addEventListener("keydown", poke);
        window.addEventListener("pointermove", poke);
        return () => {
            window.removeEventListener("keydown", poke);
            window.removeEventListener("pointermove", poke);
        };
    }, [poke]);

    return (
        <PlayerSurface
            src={stream?.url}
            autoPlay
            muted
            className="absolute inset-0"
        >
            <Hotkey keys="m" action="toggleMuted" />
            <Hotkey keys="Space" action="togglePaused" />

            <ChannelRail
                channels={channels}
                selectedId={activeId}
                onSelect={(channel) => setSelectedId(channel.id)}
                visible={visible}
                onActivity={poke}
            />

            {unavailable && (
                <div className="absolute inset-0 z-4 flex flex-col items-center justify-center gap-3 bg-base-300/80 text-center">
                    <TvMinimalPlay className="size-10 text-base-content/30" aria-hidden="true" />
                    <p className="text-sm font-semibold">Canal indisponível</p>
                    <p className="text-xs text-base-content/50">Nenhuma fonte conseguiu reproduzir este canal.</p>
                    <button type="button" onClick={retry} className="btn btn-sm btn-primary">
                        Tentar novamente
                    </button>
                </div>
            )}
        </PlayerSurface>
    );
};

export default ChannelPlayer;