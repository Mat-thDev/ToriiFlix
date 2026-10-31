import { ArrowLeft, Play } from "lucide-react";
import { useAtomValue } from "jotai";
import { settingsAtom } from "../../../atoms/settings";
import useMedia from "../../../hooks/useMedia";
import useNavigation from "../../../hooks/useNavigation";
import { resolveImdbId } from "../../../services/tmdb/tmdbDetails";
import { FocusButton } from "../../ui/FocusButton";
import { Hero } from "../../ui/Hero";
import { ErrorAlert } from "../../ui/ErrorAlert";
import { HeroSkeleton } from "../../skeletons/HeroSkeleton";
import { DetailsSkeleton } from "../../skeletons/DetailsSkeleton";
import InfoSection from "./InfoSection";
import CastSection from "./CastSection";
import SeasonsSection from "./SeasonsSection";
import GallerySection from "./GallerySection";
import RelatedSection from "./RelatedSection";

const DetailRoute = ({ id, type }: UI.DetailProps) => {
  const { item, details, detailsLoading, loading, error, retry } = useMedia(type, id);
  const { goBack, navigate } = useNavigation();
  const settings = useAtomValue(settingsAtom);

  // Relacionado vem com id TMDB; converte p/ IMDb (addons só entendem tt...) antes de navegar
  const handleRelated = async (related: Media.Related) => {
    const imdbId = await resolveImdbId(related.type, related.tmdbId, {
      apiKey: settings.addons.tmdbApiKey ?? "",
      language: settings.system.language,
    });
    if (imdbId) navigate("Detail", { id: imdbId, type: related.type });
  };

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

  // Só o Item do addon bloqueia a tela; o enriquecimento TMDB é progressivo
  if (!item || loading) return <HeroSkeleton />;

  return (
    <>
      <Hero
        item={item}
        details={details}
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

      {/* Seções enriquecidas — aparecem quando o TMDB responde; sem key/falha, só o hero */}
      <div className="mt-10 space-y-12">
        {detailsLoading && !details && <DetailsSkeleton />}

        {details && (
          <>
            <InfoSection details={details} />
            <CastSection cast={details.cast} />
            {details.type === "series" && (
              <SeasonsSection details={details} language={settings.system.language} />
            )}
            <GallerySection backdrops={details.backdrops} />
            <RelatedSection details={details} onSelect={handleRelated} />
          </>
        )}
      </div>
    </>
  );
};

export default DetailRoute;
