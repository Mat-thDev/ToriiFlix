import clsx from "clsx";

/** Campo de entrada — primitivo de texto do app. */
export const Input = ({ className, ...rest }: UI.InputProps) => (
  <input
    className={clsx("w-full bg-transparent focus:outline-none", className)}
    {...rest}
  />
);
