import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Filter, Layers, Tv } from "lucide-react";
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

    useEffect(() => {
        setVisibleCount(INITIAL_COUNT);
    }, [channels, selectedGenre]);

    const selectedIndex = selectedId ? channels.findIndex((channel) => channel.id === selectedId) : -1;
    useEffect(() => {
        if (selectedIndex >= visibleCount) setVisibleCount(selectedIndex + 1);
    }, [selectedIndex, visibleCount]);

    useEffect(() => {
        if (!visible) return;
        listRef.current?.querySelector<HTMLElement>("[data-playing]")?.scrollIntoView({ block: "center" });
    }, [visible, selectedId]);

    const onScroll = useCallback(
        (event: React.UIEvent<HTMLOListElement>) => {
            const list = event.currentTarget;
            if (list.scrollTop + list.clientHeight < list.scrollHeight - LOAD_MORE_PX) return;
            setVisibleCount((count) => Math.min(count + STEP, channels.length));
        },
        [channels.length],
    );

    // Filtro local por gênero caso o addon traga os itens e queiramos refinar instantaneamente
    const filteredChannels = selectedGenre
        ? channels.filter((c) => c.genres?.includes(selectedGenre))
        : channels;

    const shown = filteredChannels.length > visibleCount ? filteredChannels.slice(0, visibleCount) : filteredChannels;

    return (
        <nav
            aria-label="Canais e Categorias"
            data-visible={visible || undefined}
            className={clsx(
                "absolute inset-y-0 left-0 z-5 w-64 bg-gradient-to-r from-black/85 via-black/50 to-transparent",
                "pointer-events-none -translate-x-4 opacity-0 transition-[opacity,translate] duration-300",
                "data-visible:pointer-events-auto data-visible:translate-x-0 data-visible:opacity-100",
                "flex flex-col p-4 pr-2"
            )}
        >
            {/* Seletor de Addons / Fontes */}
            {addons.length > 0 && onSelectAddon && (
                <div className="mb-3 pb-3 border-b border-white/10">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">
                        <Layers className="size-3" /> Addon / Fonte
                    </label>
                    <select
                        value={selectedAddonUrl}
                        onChange={(e) => onSelectAddon(e.target.value)}
                        className="w-full bg-black/70 border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        {addons.map((addon) => (
                            <option key={addon.url} value={addon.url} className="bg-zinc-900 text-white">
                                {addon.manifest.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Seletor de Gênero / Categoria */}
            {availableGenres.length > 0 && onSelectGenre && (
                <div className="mb-3 pb-3 border-b border-white/10">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">
                        <Filter className="size-3" /> Categoria / Gênero
                    </label>
                    <select
                        value={selectedGenre || ""}
                        onChange={(e) => onSelectGenre(e.target.value ? e.target.value : undefined)}
                        className="w-full bg-black/70 border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value="" className="bg-zinc-900 text-white">Todas as categorias</option>
                        {availableGenres.map((genre) => (
                            <option key={genre} value={genre} className="bg-zinc-900 text-white">
                                {genre}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Lista de Canais */}
            <ol
                ref={listRef}
                onScroll={onScroll}
                aria-busy={loading || undefined}
                className="flex-1 space-y-3 overflow-y-auto pr-2"
            >
                {loading && channels.length === 0 &&
                    Array.from({ length: SKELETON_COUNT }, (_, i) => (
                        <li key={`skeleton-${i}`} aria-hidden="true" className="overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
                            <div className="h-16 w-full animate-pulse bg-white/10" />
                            <div className="space-y-1.5 px-3 pb-2.5 pt-2">
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
        </nav>
    );
};

export default ChannelRail;