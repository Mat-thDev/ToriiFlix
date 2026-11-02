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
        <li className="flex items-center gap-2" data-playing={playing || undefined}>
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
});

export default ChannelRow;