import { ArrowLeft, Play } from "lucide-react";
import useMedia from "../../../hooks/useMedia";
import useNavigation from "../../../hooks/useNavigation";
import { FocusButton } from "../../ui/FocusButton";
import { Hero } from "../../ui/Hero";
import { ErrorAlert } from "../../ui/ErrorAlert";
import { HeroSkeleton } from "../../skeletons/HeroSkeleton";

const DetailRoute = ({ id, type }: UI.DetailProps) => {
  const { item, loading, error, retry } = useMedia(type, id);
  const { goBack } = useNavigation();

  if (error) {
    return (
      <section aria-label="Detalhe">
        <ErrorAlert
          message={`Não foi possível carregar o item: ${error}`}
          onRetry={retry}
          extraAction={
            <FocusButton type="button" className="btn btn-sm btn-outline" onClick={goBack}>
              Voltar
            </FocusButton>
          }
        />
      </section>
    );
  }

  if (!item || loading) return <HeroSkeleton />;

  return (
    <Hero
      item={item}
      eyebrow={item.type === "movie" ? "Filme" : "Série"}
      actions={
        <>
          <FocusButton type="button" className="btn btn-primary gap-2" disabled title="Player em breve">
            <Play className="size-5" aria-hidden="true" />
            Assistir
          </FocusButton>
          <FocusButton type="button" className="btn btn-outline gap-2" onClick={goBack}>
            <ArrowLeft className="size-5" aria-hidden="true" />
            Voltar
          </FocusButton>
        </>
      }
    />
  );
};

export default DetailRoute;
