import { Info, Play } from "lucide-react";
import { FocusButton } from "./FocusButton";
import { Hero } from "./Hero";
import { HeroSkeleton } from "../skeletons/HeroSkeleton";
import useModals from "../../hooks/useModals";
import useNavigation from "../../hooks/useNavigation";

const Billboard = ({ item, loading = false }: UI.BillboardProps) => {
  const { showModal } = useModals();
  const { navigate } = useNavigation()

  if (loading) return <HeroSkeleton />;
  if (!item) return null;

  return (
    <Hero
      item={item}
      actions={
        <>
          <FocusButton onClick={() => { showModal("StreamSelector", { type: item.type, id: item.id, item, details: undefined }) }} type="button" className="btn btn-primary gap-2">
            <Play className="size-5" aria-hidden="true" />
            Assistir
          </FocusButton>
          <FocusButton onClick={() => { navigate("Detail", { type: item.type, id: item.id }) }} type="button" className="btn btn-outline gap-2">
            <Info className="size-5" aria-hidden="true" />
            Mais informações
          </FocusButton>
        </>
      }
    />
  );
};

export default Billboard;
