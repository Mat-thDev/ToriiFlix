import { RotateCcw, RotateCw } from "lucide-react";
import { SeekButton as VideoJsSeekButton } from "@videojs/react";

const SkipButton = ({ time }: Player.SkipButtonProps) => (
  <VideoJsSeekButton
    seconds={time}
    className="flex size-11 items-center justify-center rounded-(--radius-field) p-0 text-base-content transition-colors hover:bg-base-content/10 hover:text-primary"
    label={time < 0 ? "Voltar 15 segundos" : "Avançar 15 segundos"}
    render={(props) => (
      <button {...props}>{time < 0 ? <RotateCcw className="size-7" /> : <RotateCw className="size-7" />}</button>
    )}
  />
);

export default SkipButton;
