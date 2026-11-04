import { useCallback, useState } from "react";
import { Hotkey } from "@videojs/react";
import { Tv, TvMinimalPlay } from "lucide-react";
import { SpatialNavigation } from "@noriginmedia/norigin-spatial-navigation-core";
import { useAutoHide } from "../../../hooks/useAutoHide";
import useChannelStream from "../../../hooks/useChannelStream";
import useSettings from "../../../hooks/useSettings";
import PlayerSurface from "../PlayerSurface";
import PlayerKeyHandler from "../PlayerKeyHandler";
import PlayerControls from "../controls/PlayerControls";
import PlayerRow from "../controls/PlayerRow";
import PlayButton from "../controls/PlayButton";
import VolumeBar from "../controls/VolumeBar";
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
    const activeChannel = channels.find((c) => c.id === activeId);
    const activeKind = activeChannel?.type ?? "channel";

    const handleSelect = useCallback((channel: Media.Item) => setSelectedId(channel.id), []);

    const { visible, poke, hide } = useAutoHide();
    const { stream, unavailable, retry } = useChannelStream(activeId, activeKind);
    const { settings } = useSettings();

    // OK/dir com foco em body → abre o rail e foca no canal que já está no ar.
    // O foco passa pelo norigin (setFocus com a focusKey estável do card) —
    // .focus() nativo não atualiza o estado dele e as setas morreriam no rail.
    const openRail = useCallback(() => {
        poke();
        requestAnimationFrame(() => {
            const keys = [
                activeId && `CHANNEL_${activeId}`,
                channels[0] && `CHANNEL_${channels[0].id}`,
                "GENRE_ALL", // fallback: chip "Todas" (presente quando há categorias)
            ];
            const target = keys.find((key) => key && SpatialNavigation.doesFocusableExist(key));
            if (target) SpatialNavigation.setFocus(target);
        });
    }, [poke, activeId, channels]);

    // Esq dentro da lista → fecha o rail: blur devolve o foco pra body,
    // de onde OK/dir reabre. hide() já cancela o timer do autohide.
    const closeRail = useCallback(() => {
        hide();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    }, [hide]);

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
            <PlayerKeyHandler mode="channels" onRailOpen={openRail} onRailClose={closeRail} />

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

            {/* Barra de controles (estilo player de filmes) — play + volume à
                esquerda, indicador "Ao vivo" à direita. Autohide do videojs;
                no TV os botões não recebem foco, as setas do body cuidam disso. */}
            <PlayerControls>
                <PlayerRow top>
                    <div
                        className="pointer-events-none min-w-0 overflow-hidden text-ellipsis whitespace-nowrap [text-shadow:0_1px_8px_color-mix(in_oklab,var(--color-base-300)_80%,transparent)]"
                        data-media-state
                    >
                        <span className="truncate text-base! font-bold">
                            {activeChannel?.name ?? "Canal"}
                        </span>
                    </div>
                    {/* Abre/fecha o rail — affordance pro mouse; no remote o
                        OK/Dir abre e a Esq dentro da lista fecha */}
                    <button
                        type="button"
                        onClick={() => (visible ? closeRail() : openRail())}
                        aria-label={visible ? "Fechar lista de canais" : "Abrir lista de canais"}
                        className="ml-auto flex shrink-0 items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-base-content ring-1 ring-white/15 transition-colors hover:bg-black/75"
                    >
                        <Tv className="size-4" aria-hidden="true" />
                        Canais
                    </button>
                </PlayerRow>
                <PlayerRow bottom>
                    <div className="flex items-center justify-between">
                        <div className="pointer-events-auto flex w-full items-center gap-2">
                            <PlayButton />
                            <VolumeBar playbackSettings={settings.playback} />
                        </div>
                        <span className="pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-content">
                            <span className="relative flex size-2" aria-hidden="true">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-content opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-primary-content" />
                            </span>
                            Ao vivo
                        </span>
                    </div>
                </PlayerRow>
            </PlayerControls>

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