import clsx from "clsx";
import { Tv } from "lucide-react";
import { memo } from "react";
import { FocusButton } from "../../ui/FocusButton";

const ChannelRow = memo(function ChannelRow({
    channel,
    index,
    playing,
    onSelect,
    onActivity,
}: UI.ChannelRowProps) {
    return (
        <li className="flex items-center" data-playing={playing || undefined}>
            <FocusButton
                type="button"
                // Chave estável: o ChannelPlayer usa SpatialNavigation.setFocus
                // nela pra abrir o rail já no canal em exibição.
                focusKey={`CHANNEL_${channel.id}`}
                title={channel.name}
                aria-label={`Canal ${index + 1}: ${channel.name}`}
                aria-current={playing || undefined}
                onClick={() => {
                    onActivity?.();
                    onSelect(channel);
                }}
                onFocus={() => {
                    onActivity?.();
                }}
                className={clsx(
                    "flex w-full shrink-0 items-center gap-3 rounded-xl p-2 text-left",
                    "ring-1 transition-all duration-200",
                    "bg-black/55 ring-white/10",
                    "data-focused:ring-2 data-focused:ring-primary data-focused:scale-[1.02]",
                    playing && "bg-white/15 ring-white/30",
                )}
            >
                {/* logo quadrada à esquerda (padrão do rail) */}
                <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
                    {channel.poster ? (
                        <img
                            src={channel.poster}
                            alt=""
                            loading="lazy"
                            className="size-full object-contain p-1.5"
                        />
                    ) : (
                        <Tv className="size-6 text-white/40" aria-hidden="true" />
                    )}
                </span>

                {/* nome + meta */}
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="block truncate text-sm font-semibold text-white/90">
                        {index + 1} - {channel.name}
                    </span>

                    <span className="flex items-center gap-1.5 overflow-hidden">
                        {playing && (
                            <span className="flex shrink-0 items-center gap-1 rounded-sm bg-primary px-1.5 py-px text-[9px] font-bold tracking-wider text-primary-content uppercase">
                                <span className="size-1 animate-pulse rounded-full bg-primary-content" aria-hidden="true" />
                                Ao vivo
                            </span>
                        )}
                        {channel.genres?.[0] && (
                            <span className="truncate text-[10px] font-medium text-white/45">
                                {channel.genres[0]}
                            </span>
                        )}
                        {channel.rating && (
                            <span className="shrink-0 rounded-sm bg-white/10 px-1 py-px text-[9px] font-bold tabular-nums text-white/60">
                                ★ {channel.rating}
                            </span>
                        )}
                        {channel.year && (
                            <span className="shrink-0 text-[9px] font-semibold tabular-nums text-white/45">
                                {channel.year}
                            </span>
                        )}
                    </span>
                </span>
            </FocusButton>
        </li>
    );
});

export default ChannelRow;
