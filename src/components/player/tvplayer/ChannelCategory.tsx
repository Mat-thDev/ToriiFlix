import { memo } from "react";
import clsx from "clsx";
import { LayoutGrid } from "lucide-react";
import { FocusButton } from "../../ui/FocusButton";

/** Tom estável por gênero — colore o selo circular sem depender de assets. */
const hueOf = (label: string): number => {
    let h = 0;
    for (let i = 0; i < label.length; i += 1) h = (h * 31 + label.charCodeAt(i)) % 360;
    return h;
};

interface ChannelCategoryProps {
    label: string;
    count: number;
    selected: boolean;
    /** "Todas" usa ícone em vez da inicial do rótulo. */
    all?: boolean;
    focusKey: string;
    onSelect: () => void;
    onActivity?: () => void;
}

const ChannelCategory = memo(function ChannelCategory({
    label,
    count,
    selected,
    all = false,
    focusKey,
    onSelect,
    onActivity,
}: ChannelCategoryProps) {
    const hue = hueOf(label);

    return (
        <li>
            <FocusButton
                type="button"
                focusKey={focusKey}
                aria-pressed={selected}
                aria-label={all ? `Todas as categorias, ${count} canais` : `${label}, ${count} canais`}
                onFocus={() => onActivity?.()}
                onClick={() => {
                    onActivity?.();
                    onSelect();
                }}
                className={clsx(
                    "relative flex w-full items-center gap-2.5 rounded-lg py-2 pl-3 pr-2 text-left transition-colors",
                    selected ? "bg-white/10" : "hover:bg-white/5",
                )}
            >
                {/* acento da categoria ativa */}
                <span
                    aria-hidden="true"
                    className={clsx(
                        "absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full bg-primary transition-all",
                        selected ? "w-1" : "w-0",
                    )}
                />

                <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full"
                    style={
                        all
                            ? { backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }
                            : {
                                backgroundColor: `hsl(${hue} 55% 45% / 0.32)`,
                                color: `hsl(${hue} 75% 80%)`,
                            }
                    }
                >
                    {all ? (
                        <LayoutGrid className="size-4" />
                    ) : (
                        <span className="text-[11px] font-bold">{label.trim().charAt(0).toUpperCase()}</span>
                    )}
                </span>

                <span
                    className={clsx(
                        "min-w-0 flex-1 truncate text-[13px] leading-tight",
                        selected ? "font-bold text-white" : "font-medium text-white/70",
                    )}
                >
                    {label}
                </span>

                <span
                    className={clsx(
                        "shrink-0 text-[11px] font-semibold tabular-nums",
                        selected ? "text-primary" : "text-white/40",
                    )}
                >
                    {count}
                </span>
            </FocusButton>
        </li>
    );
});

export default ChannelCategory;
