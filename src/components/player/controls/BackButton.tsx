import { ArrowLeft } from "lucide-react";

const BackButton = ({ onClick }: Player.BackButtonProps) => {
  return (
    <button
      type="button"
      aria-label="Sair do player"
      className="flex items-center justify-center gap-2 rounded-lg bg-base-300/40 px-3 py-2 text-xs font-bold tracking-widest text-base-content uppercase backdrop-blur-sm ring-1 ring-base-content/10 transition-colors hover:bg-base-content/10 hover:text-primary"
      onClick={() => onClick?.()}
    >
      <ArrowLeft className="size-4" aria-hidden />
      Sair
    </button>
  )
};

export default BackButton;
