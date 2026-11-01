import clsx from "clsx";

const PlayerRow = ({ bottom, children }: Player.ControlsRowProps) => (
  <div
    className={clsx(
      "relative flex w-full items-center gap-3 whitespace-nowrap *:pointer-events-auto",
      bottom && "flex-col items-stretch gap-2",
    )}
  >
    {children}
  </div>
);

export default PlayerRow;
