const PlayerMediaInfo = ({ mediaData }: { mediaData: Player.MediaPayload }) => (
  <div
    className="pointer-events-none min-w-0 overflow-hidden text-ellipsis whitespace-nowrap [text-shadow:0_1px_8px_color-mix(in_oklab,var(--color-base-300)_80%,transparent)]"
    data-media-state
  >
    <span className="truncate text-base! font-bold">{mediaData.details?.name ?? mediaData.item.name}</span>
  </div>
);

export default PlayerMediaInfo;
