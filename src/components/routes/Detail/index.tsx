import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import { useAtomValue } from "jotai";
import { settingsAtom } from "../../../atoms/settings";
import useMedia from "../../../hooks/useMedia";
import useNavigation from "../../../hooks/useNavigation";
import { useAppTransition } from "../../../hooks/useAppearance";
import { resolveImdbId } from "../../../services/tmdb/tmdbDetails";
import { FocusButton } from "../../ui/FocusButton";
import { Hero } from "../../ui/Hero";
import { ErrorAlert } from "../../ui/ErrorAlert";
import { HeroSkeleton } from "../../skeletons/HeroSkeleton";
import { DetailsSkeleton } from "../../skeletons/DetailsSkeleton";
import TabBar from "./TabBar";
import EpisodesTab from "./EpisodesTab";
import InfoSection from "./InfoSection";
import CastSection from "./CastSection";
import GallerySection from "./GallerySection";
import RelatedSection from "./RelatedSection";

/**
 * Rota de detalhe — hero + abas (estilo Stremio): Episódios (séries),
 * Detalhes e Relacionados. O Item do addon aparece na hora; as abas com
 * conteúdo TMDB surgem quando o enriquecimento responde (sem key/falha,
 * só o hero é exibido — a tela nunca quebra).
 */
const DetailRoute = ({ id, type }: UI.DetailProps) => {
  const { item, details, detailsLoading, loading, error, retry } = useMedia(type, id);
  const { goBack, navigate } = useNavigation();
  const settings = useAtomValue(settingsAtom);
  const tabTransition = useAppTransition(0.2);

  // null = ainda não escolhida (série começa em Episódios, filme em Detalhes)
  const [tab, setTab] = useState<UI.DetailTabId | null>(null);
  const activeTab: UI.DetailTabId = tab ?? (item?.type === "series" ? "episodes" : "details");

  // Navegação Detail→Detail preserva o componente: volta p/ a aba padrão
  useEffect(() => setTab(null), [id, type]);

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

  const tabs: UI.DetailTab[] = [
    ...(item.type === "series" ? [{ id: "episodes" as const, label: "Episódios" }] : []),
    { id: "details", label: "Detalhes" },
    { id: "related", label: "Relacionados" },
  ];

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

      <div className="mt-8">
        <TabBar tabs={tabs} active={activeTab} onChange={setTab} />

        <div className="mt-6 rounded-2xl bg-base-200/60 p-6 ring-1 ring-base-content/5">
          {detailsLoading && !details && <DetailsSkeleton />}

          {details && (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={tabTransition}
              >
                {activeTab === "episodes" && item.type === "series" && (
                  <EpisodesTab details={details} language={settings.system.language} />
                )}

                {activeTab === "details" && (
                  <div className="space-y-10">
                    <InfoSection details={details} />
                    <CastSection cast={details.cast} />
                    <GallerySection backdrops={details.backdrops} />
                  </div>
                )}

                {activeTab === "related" && <RelatedSection details={details} onSelect={handleRelated} />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
};

export default DetailRoute;
