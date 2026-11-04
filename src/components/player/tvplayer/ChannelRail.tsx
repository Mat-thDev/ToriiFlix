import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Filter, Tv } from "lucide-react";
import ChannelCategory from "./ChannelCategory";
import ChannelRow from "./ChannelRow";

const INITIAL_COUNT = 30;
const STEP = 30;
const LOAD_MORE_PX = 300;
const SKELETON_COUNT = 6;


const ChannelRail = ({
    channels,
    selectedId,
    onSelect,
    visible,
    onActivity,
    loading,
    addons = [],
    selectedAddonUrl,
    onSelectAddon,
    selectedGenre,
    onSelectGenre,
    availableGenres = [],
}: Player.ChannelRailProps) => {
    const listRef = useRef<HTMLOListElement>(null);
    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

    // Filtro local por gênero caso o addon traga os itens e queiramos refinar instantaneamente
    const filteredChannels = useMemo(
        () => (selectedGenre ? channels.filter((c) => c.genres?.includes(selectedGenre)) : channels),
        [channels, selectedGenre],
    );

    // Contagem por categoria — coluna de categorias com números ao vivo
    const counts = useMemo(() => {
        const map = new Map<string, number>();
        for (const channel of channels)
            for (const genre of channel.genres ?? []) map.set(genre, (map.get(genre) ?? 0) + 1);
        return map;
    }, [channels]);

    useEffect(() => {
        setVisibleCount(INITIAL_COUNT);
    }, [channels, selectedGenre]);

    const selectedIndex = selectedId
        ? filteredChannels.findIndex((channel) => channel.id === selectedId)
        : -1;
    useEffect(() => {
        if (selectedIndex >= visibleCount) setVisibleCount(selectedIndex + 1);
    }, [selectedIndex, visibleCount]);

    useEffect(() => {
        if (!visible) return;
        listRef.current?.querySelector<HTMLElement>("[data-playing]")?.scrollIntoView({ block: "center" });
    }, [visible, selectedId, selectedGenre]);

    const onScroll = useCallback(
        (event: React.UIEvent<HTMLOListElement>) => {
            const list = event.currentTarget;
            if (list.scrollTop + list.clientHeight < list.scrollHeight - LOAD_MORE_PX) return;
            setVisibleCount((count) => Math.min(count + STEP, filteredChannels.length));
        },
        [filteredChannels.length],
    );

    const shown = filteredChannels.length > visibleCount
        ? filteredChannels.slice(0, visibleCount)
        : filteredChannels;

    const hasCategories = availableGenres.length > 0 && !!onSelectGenre;

    return (
        <nav
            aria-label="Canais e Categorias"
            data-channel-rail=""
            data-visible={visible || undefined}
            // Mantém o painel vivo só quando o mouse está por cima dele —
            // mover o mouse sobre o vídeo NÃO abre mais o rail (não bloqueia os controles).
            onPointerMove={() => onActivity?.()}
            className={clsx(
                // Painel largo com limites: duas colunas (categorias + canais) sem
                // cobrir o vídeo todo em resoluções grandes.
                "absolute inset-y-0 left-0 z-5 flex flex-col",
                "w-[58%] max-w-[1120px] min-w-[460px]",
                "bg-black/90",
                "pointer-events-none -translate-x-4 opacity-0 transition-[opacity,translate] duration-300",
                "data-visible:pointer-events-auto data-visible:translate-x-0 data-visible:opacity-100",
                "p-4 pr-3",
            )}
        >
            {/* Cabeçalho — título + addon quando existir */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5">
                <h2 className="min-w-0 truncate text-lg font-bold leading-tight text-white">Canais</h2>
                {addons.length > 0 && onSelectAddon && (
                    <select
                        aria-label="Addon / Fonte"
                        value={selectedAddonUrl}
                        onChange={(e) => onSelectAddon(e.target.value)}
                        className="max-w-[50%] shrink-0 rounded-lg border border-white/15 bg-black/70 px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        {addons.map((addon) => (
                            <option key={addon.url} value={addon.url} className="bg-zinc-900 text-white">
                                {addon.manifest.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="flex min-h-0 flex-1 gap-3 pt-3">
                {/* Coluna de categorias — vertical; quando está focada, a esquerda fecha o rail */}
                {hasCategories && (
                    <aside data-rail-categories className="flex w-44 shrink-0 flex-col">
                        <span className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-bold tracking-wider text-white/45 uppercase">
                            <Filter className="size-3" aria-hidden="true" /> Categorias
                        </span>
                        <ol aria-label="Categorias" className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
                            <ChannelCategory
                                all
                                label="Todas"
                                count={channels.length}
                                selected={!selectedGenre}
                                focusKey="GENRE_ALL"
                                onSelect={() => onSelectGenre?.(undefined)}
                                onActivity={onActivity}
                            />
                            {availableGenres.map((genre) => (
                                <ChannelCategory
                                    key={genre}
                                    label={genre}
                                    count={counts.get(genre) ?? 0}
                                    selected={selectedGenre === genre}
                                    focusKey={`GENRE_${genre}`}
                                    onSelect={() => onSelectGenre?.(genre)}
                                    onActivity={onActivity}
                                />
                            ))}
                        </ol>
                    </aside>
                )}

                {/* Lista de canais */}
                <section data-rail-channels className="flex min-w-0 flex-1 flex-col">
                    <span className="mb-1.5 truncate px-1 text-[10px] font-bold tracking-wider text-white/45 uppercase">
                        {filteredChannels.length} {filteredChannels.length === 1 ? "canal" : "canais"}
                        {selectedGenre ? ` · ${selectedGenre}` : ""}
                    </span>
                    <ol
                        ref={listRef}
                        onScroll={onScroll}
                        aria-busy={loading || undefined}
                        aria-label="Lista de canais"
                        className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1"
                    >
                        {loading && channels.length === 0 &&
                            Array.from({ length: SKELETON_COUNT }, (_, i) => (
                                <li
                                    key={`skeleton-${i}`}
                                    aria-hidden="true"
                                    className="flex items-center gap-3 rounded-xl bg-white/5 p-2 ring-1 ring-white/10"
                                >
                                    <div className="size-14 shrink-0 animate-pulse rounded-lg bg-white/10" />
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <div className="h-3 w-3/4 animate-pulse rounded bg-white/10" />
                                        <div className="h-2 w-1/2 animate-pulse rounded bg-white/10" />
                                    </div>
                                </li>
                            ))}

                        {!loading && filteredChannels.length === 0 && (
                            <li className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/20 px-4 py-10 text-center">
                                <Tv className="size-8 text-white/30" aria-hidden="true" />
                                <p className="text-sm font-semibold text-white/80">Nenhum canal encontrado</p>
                                <p className="text-xs text-white/50">Tente selecionar outra categoria ou addon.</p>
                            </li>
                        )}

                        {shown.map((channel, index) => (
                            <ChannelRow
                                key={channel.id}
                                channel={channel}
                                index={index}
                                playing={channel.id === selectedId}
                                onSelect={onSelect}
                                onActivity={onActivity}
                            />
                        ))}
                    </ol>
                </section>
            </div>
        </nav>
    );
};

export default ChannelRail;
