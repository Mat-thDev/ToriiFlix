import { Controls } from "@videojs/react";

const PlayerControls = ({ children }: Player.ControlsProps) => (
  <Controls.Root>
    <Controls.Backdrop className="pointer-events-none absolute inset-0 z-1 bg-linear-to-b from-base-300/60 via-transparent via-30% to-base-300/75 transition-opacity duration-300 not-data-visible:not-has-focus-visible:opacity-0" />
    <Controls.Content
      data-controls
      className="absolute inset-0 z-2 flex flex-col justify-between gap-3 p-6 text-base-content pointer-events-none transition-opacity duration-300 not-data-visible:not-has-focus-visible:opacity-0"
    >
      {children}
    </Controls.Content>
  </Controls.Root>
);

export default PlayerControls;
