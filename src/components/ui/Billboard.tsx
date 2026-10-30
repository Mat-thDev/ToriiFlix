import { Info, Play } from "lucide-react";
import { FocusButton } from "./FocusButton";
import { Hero } from "./Hero";
import { HeroSkeleton } from "../skeletons/HeroSkeleton";

/** Billboard de destaque da Home — Hero com ações padrão de catálogo. */
const Billboard = ({ item, loading = false }: UI.BillboardProps) => {
  if (loading) return <HeroSkeleton />;
  if (!item) return null;

  return (
    <Hero
      item={item}
      actions={
        <>
          <FocusButton type="button" className="btn btn-primary gap-2">
            <Play className="size-5" aria-hidden="true" />
            Assistir
          </FocusButton>
          <FocusButton type="button" className="btn btn-outline gap-2">
            <Info className="size-5" aria-hidden="true" />
            Mais informações
          </FocusButton>
        </>
      }
    />
  );
};

export default Billboard;
