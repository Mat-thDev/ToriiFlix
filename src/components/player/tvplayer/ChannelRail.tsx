import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Filter, Tv } from "lucide-react";
import { FocusButton } from "../../ui/FocusButton";
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
            data-channel-rail=""
            data-visible={visible || undefined}
            // Mantém o painel vivo só quando o mouse está por cima dele —
            // mover o mouse sobre o vídeo NÃO abre mais o rail (não bloqueia os controles).
            onPointerMove={() => onActivity?.()}
            className={clsx(
                // Painel largo com limites: ocupa a tela de forma proporcional
                // sem cobrir o vídeo todo em resoluções grandes.
                "absolute inset-y-0 left-0 z-5 flex flex-col",
                "w-[44%] max-w-180 min-w-[340px]",
                "bg-black/90",
                "pointer-events-none -translate-x-4 opacity-0 transition-[opacity,translate] duration-300",
                "data-visible:pointer-events-auto data-visible:translate-x-0 data-visible:opacity-100",
                "p-5 pr-4",
            )}
        >
            {/* Cabeçalho — título + contagem (+ addon quando existir) */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold leading-tight text-white">Canais</h2>
                    <p className="text-[11px] font-medium text-white/50">
                        {filteredChannels.length} {filteredChannels.length === 1 ? "canal" : "canais"}
                        {selectedGenre ? ` · ${selectedGenre}` : ""}
                    </p>
                </div>
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

            {/* Categorias — chips focáveis pelo remote: Esq/Dir trocam de
                categoria (linha detectada pelo PlayerKeyHandler como "chip row",
                então a esquerda aqui navega em vez de fechar o rail) */}
            {availableGenres.length > 0 && onSelectGenre && (
                <div data-chip-row className="border-b border-white/10 py-3">
                    <span className="mb-2 flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-white/50 uppercase">
                        <Filter className="size-3" /> Categorias
                    </span>
                    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
                        <FocusButton
                            type="button"
                            focusKey="GENRE_ALL"
                            aria-pressed={!selectedGenre}
                            onFocus={() => onActivity?.()}
                            onClick={() => {
                                onActivity?.();
                                onSelectGenre(undefined);
                            }}
                            className={clsx(
                                "max-w-full shrink-0 truncate rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                                !selectedGenre
                                    ? "bg-primary text-primary-content"
                                    : "bg-white/10 text-white/70 hover:bg-white/15",
                            )}
                        >
                            Todas
                        </FocusButton>
                        {availableGenres.map((genre) => (
                            <FocusButton
                                key={genre}
                                type="button"
                                focusKey={`GENRE_${genre}`}
                                aria-pressed={selectedGenre === genre}
                                onFocus={() => onActivity?.()}
                                onClick={() => {
                                    onActivity?.();
                                    onSelectGenre(genre);
                                }}
                                className={clsx(
                                    "max-w-full shrink-0 truncate rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                                    selectedGenre === genre
                                        ? "bg-primary text-primary-content"
                                        : "bg-white/10 text-white/70 hover:bg-white/15",
                                )}
                            >
                                {genre}
                            </FocusButton>
                        ))}
                    </div>
                </div>
            )}

            {/* Lista de Canais */}
            <ol
                ref={listRef}
                onScroll={onScroll}
                aria-busy={loading || undefined}
                className="flex-1 space-y-2.5 overflow-y-auto pr-1 pt-3"
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
        </nav>
    );
};

export default ChannelRail;
