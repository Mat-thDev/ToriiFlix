import { useEffect, useRef } from "react";
import clsx from "clsx";
import { Tv } from "lucide-react";
import { FocusButton } from "../ui/FocusButton";


const ChannelRail = ({ channels, selectedId, onSelect, visible, onActivity }: Player.ChannelRailProps) => {
    const listRef = useRef<HTMLOListElement>(null);

    useEffect(() => {
        if (!visible) return;
        listRef.current
            ?.querySelector<HTMLElement>("[data-playing]")
            ?.scrollIntoView({ block: "center" });
    }, [visible, selectedId]);

    return (
        <nav
            aria-label="Canais"
            data-visible={visible || undefined}
            className={clsx(
                "absolute inset-y-0 left-0 z-5 w-48 bg-linear-to-r from-black/75 via-black/35 to-transparent",
                "pointer-events-none -translate-x-4 opacity-0 transition-[opacity,translate] duration-300",
                "data-visible:pointer-events-auto data-visible:translate-x-0 data-visible:opacity-100",
            )}
        >
            <ol ref={listRef} className="h-full space-y-3 overflow-y-auto p-4 pr-6">
                {channels.length === 0 && (
                    <li className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/20 px-4 py-10 text-center">
                        <Tv className="size-8 text-white/30" aria-hidden="true" />
                        <p className="text-sm font-semibold text-white/80">Nenhum canal</p>
                        <p className="text-xs text-white/50">Habilite um addon de canais nas configurações.</p>
                    </li>
                )}

                {channels.map((channel, index) => {
                    const playing = channel.id === selectedId;

                    return (
                        <li key={channel.id} className="flex items-center gap-2" data-playing={playing || undefined}>
                            <FocusButton
                                type="button"
                                title={channel.name}
                                aria-label={`Canal ${index + 1}: ${channel.name}`}
                                aria-current={playing || undefined}
                                onClick={() => {
                                    onActivity?.();
                                    onSelect(channel);
                                }}
                                onFocus={(event: React.FocusEvent<HTMLElement>) => {
                                    onActivity?.();
                                    event.currentTarget.scrollIntoView({ block: "center" });
                                }}
                                className={clsx(
                                    "flex w-full shrink-0 flex-col overflow-hidden rounded-xl p-0 text-left",
                                    "ring-1 transition-all duration-200",
                                    "bg-black/55 ring-white/10",
                                    "data-focused:ring-2 data-focused:ring-primary data-focused:scale-[1.03]",
                                    playing && "bg-white ring-white data-focused:ring-primary",
                                )}
                            >
                                {/* logo */}
                                <span className="flex h-16 w-full items-center justify-center px-3">
                                    {channel.poster ? (
                                        <img
                                            src={channel.poster}
                                            alt=""
                                            loading="lazy"
                                            className={clsx(
                                                "max-h-14 w-full object-contain",
                                                // Card branco da referencia: logo vira silhueta preta
                                                playing && "brightness-0",
                                            )}
                                        />
                                    ) : (
                                        <Tv className={clsx("size-7 text-white/40", playing && "text-black/50")} aria-hidden="true" />
                                    )}
                                </span>

                                {/* nome + badges */}
                                <span className="flex w-full flex-col gap-1 px-3 pb-2.5 pt-0.5">
                                    <span
                                        className={clsx(
                                            "block truncate text-xs font-semibold",
                                            playing ? "text-black/90" : "text-white/90",
                                        )}
                                    >
                                        {index + 1} - {channel.name}
                                    </span>

                                    <span className="flex items-center gap-1.5">
                                        {playing && (
                                            <span className="flex items-center gap-1 rounded-sm bg-primary px-1.5 py-px text-[9px] font-bold tracking-wider text-primary-content uppercase">
                                                <span className="size-1 animate-pulse rounded-full bg-primary-content" aria-hidden="true" />
                                                Ao vivo
                                            </span>
                                        )}
                                        {channel.rating && (
                                            <span
                                                className={clsx(
                                                    "rounded-sm px-1 py-px text-[9px] font-bold tabular-nums",
                                                    playing ? "bg-black/10 text-black/60" : "bg-white/10 text-white/60",
                                                )}
                                            >
                                                ★ {channel.rating}
                                            </span>
                                        )}
                                        {channel.year && (
                                            <span
                                                className={clsx(
                                                    "text-[9px] font-semibold tabular-nums",
                                                    playing ? "text-black/50" : "text-white/50",
                                                )}
                                            >
                                                {channel.year}
                                            </span>
                                        )}
                                    </span>
                                </span>
                            </FocusButton>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default ChannelRail;
