import { useCallback, useEffect, useState } from "react";
import { Hotkey } from "@videojs/react";
import { TvMinimalPlay } from "lucide-react";
import { useAutoHide } from "../../../hooks/useAutoHide";
import useChannelStream from "../../../hooks/useChannelStream";
import PlayerSurface from "../PlayerSurface";
import ChannelRail from "./ChannelRail";


const ChannelPlayer = ({
    channels,
    loading,
    addons = [],
    selectedAddonUrl,
    onSelectAddon,
}: Player.ChannelPlayerProps) => {
    const [selectedId, setSelectedId] = useState<string>();
    const [selectedGenre, setSelectedGenre] = useState<string>();

    const activeId = selectedId ?? channels[0]?.id;
    const activeKind = channels.find((c) => c.id === activeId)?.type ?? "channel";

    const handleSelect = useCallback((channel: Media.Item) => setSelectedId(channel.id), []);

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

    const availableGenres = Array.from(
        new Set(channels.flatMap((c) => c.genres || []))
    ).filter(Boolean);

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
                onSelect={handleSelect}
                visible={visible}
                onActivity={poke}
                loading={loading}
                addons={addons}
                selectedAddonUrl={selectedAddonUrl}
                onSelectAddon={onSelectAddon}
                selectedGenre={selectedGenre}
                onSelectGenre={setSelectedGenre}
                availableGenres={availableGenres}
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