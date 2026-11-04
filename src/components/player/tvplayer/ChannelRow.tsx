import clsx from "clsx";
import { Tv } from "lucide-react";
import { memo } from "react";
import { FocusButton } from "../../ui/FocusButton";

const QUALITY_RE = /\b(4k|2160p|uhd|fhd|1080p|hd|720p|sd|480p)\b/i;
const QUALITY_LABEL: Record<string, string> = {
    "4k": "4K",
    "2160p": "4K",
    uhd: "4K",
    fhd: "FHD",
    "1080p": "FHD",
    hd: "HD",
    "720p": "HD",
    sd: "SD",
    "480p": "SD",
};

/** Qualidade escrita no nome do canal (ex.: "Nat Geo HD") — badge HD/4K/FHD/SD. */
const qualityOf = (name: string): string | undefined => {
    const match = QUALITY_RE.exec(name);
    return match ? QUALITY_LABEL[match[1].toLowerCase()] : undefined;
};

const ChannelRow = memo(function ChannelRow({
    channel,
    index,
    playing,
    onSelect,
    onActivity,
}: UI.ChannelRowProps) {
    const quality = qualityOf(channel.name);
    const genre = channel.genres?.[0];

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
                    "relative flex w-full shrink-0 items-center gap-3 overflow-hidden rounded-xl p-2 text-left",
                    "ring-1 transition-colors",
                    playing
                        ? "bg-primary/15 ring-primary/45 data-focused:bg-primary/25"
                        : "bg-white/[0.05] ring-white/10 hover:bg-white/[0.09] data-focused:bg-white/[0.12]",
                )}
            >
                {/* acento à esquerda do canal em exibição */}
                {playing && (
                    <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-primary" />
                )}

                {/* logo quadrada à esquerda (padrão do rail) */}
                <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/15">
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
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="block truncate text-sm font-semibold leading-tight text-white">
                        {channel.name}
                    </span>

                    <span className="flex items-center gap-1.5 overflow-hidden">
                        {playing && (
                            <span className="flex shrink-0 items-center gap-1 rounded-sm bg-primary px-1.5 py-px text-[9px] font-bold tracking-wider text-primary-content uppercase">
                                <span className="size-1 animate-pulse rounded-full bg-primary-content" aria-hidden="true" />
                                Ao vivo
                            </span>
                        )}
                        {quality && (
                            <span className="shrink-0 rounded-sm bg-white/10 px-1.5 py-px text-[9px] font-bold tracking-wider text-white/75 ring-1 ring-white/15">
                                {quality}
                            </span>
                        )}
                        {genre && (
                            <span className="min-w-0 truncate text-[10px] font-medium text-white/45">
                                {genre}
                            </span>
                        )}
                        {channel.year && (
                            <span className="shrink-0 text-[10px] font-medium tabular-nums text-white/45">
                                {channel.year}
                            </span>
                        )}
                        {channel.rating && (
                            <span className="ml-auto shrink-0 rounded-sm bg-white/10 px-1 py-px text-[9px] font-bold tabular-nums text-white/60">
                                ★ {channel.rating}
                            </span>
                        )}
                    </span>
                </span>
            </FocusButton>
        </li>
    );
});

export default ChannelRow;
