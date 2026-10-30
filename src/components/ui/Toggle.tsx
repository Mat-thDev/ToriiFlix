import { useState } from "react";
import clsx from "clsx";
import { FocusButton } from "./FocusButton";

/** Switch focável — primitivo de configuração booleana (navegação espacial). */
export const Toggle = ({ label, checked, defaultOn = false, onChange }: UI.ToggleProps) => {
  const [internal, setInternal] = useState(defaultOn);
  const on = checked ?? internal;

  const toggle = () => {
    const next = !on;
    if (checked === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <FocusButton
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={toggle}
      className={clsx(
        "relative h-7 w-12 shrink-0 rounded-full border transition-colors",
        on ? "border-primary bg-primary/30" : "border-base-content/20 bg-base-content/10",
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "absolute top-1/2 size-5 -translate-y-1/2 rounded-full transition-all",
          on ? "left-6 bg-primary" : "left-1 bg-base-content/50",
        )}
      />
    </FocusButton>
  );
};
