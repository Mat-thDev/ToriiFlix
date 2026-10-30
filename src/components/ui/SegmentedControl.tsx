import clsx from "clsx";
import { FocusButton } from "./FocusButton";

/** Opções mutuamente exclusivas — alternativa de TV para selects. */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ...rest
}: UI.SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      className="flex shrink-0 gap-1 rounded-full border border-base-content/10 bg-base-content/5 p-1"
      {...rest}
    >
      {options.map((option) => (
        <FocusButton
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
            option.value === value
              ? "bg-primary text-primary-content"
              : "text-base-content/60 hover:text-base-content",
          )}
        >
          {option.label}
        </FocusButton>
      ))}
    </div>
  );
}