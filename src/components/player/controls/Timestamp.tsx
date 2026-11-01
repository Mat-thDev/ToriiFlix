import { Time } from "@videojs/react";

const Timestamp = ({ type }: Player.TimestampProps) => (
  <Time.Value type={type} className="tabular-nums text-xs whitespace-nowrap opacity-80" />
);

export default Timestamp;
