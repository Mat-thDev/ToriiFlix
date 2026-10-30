import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { addonsAtom } from "../../../atoms/addons";
import useCatalog from "../../../hooks/useCatalog";
import useNavigation from "../../../hooks/useNavigation";
import { externalCatalogSections } from "../../../services/stremio/sections";
import MediaSection from "../../ui/MediaSection";
import Billboard from "../../ui/Billboard";
import { ErrorAlert } from "../../ui/ErrorAlert";

const HOME_SECTIONS: UI.MediaSectionProps[] = [
  { title: "Filmes em alta", kind: "movie", list: "top" },
  { title: "Séries em alta", kind: "series", list: "top" },
  { title: "Melhor avaliados", kind: "movie", list: "imdbRating" },
  { title: "Séries em destaque", kind: "series", list: "featured" },
  { title: "Lançamentos 2026", kind: "movie", list: "year", genre: "2026" },
  { title: "Ação", kind: "movie", list: "top", genre: "Action" },
  { title: "Comédia", kind: "movie", list: "top", genre: "Comedy" },
];

const HomeRoute = () => {
  const { page, loading, error, retry } = useCatalog("movie", { list: "featured", limit: 10 });
  const { navigate } = useNavigation();
  const addons = useAtomValue(addonsAtom);

  const openDetail = (item: Media.Item) => {
    navigate("Detail", { id: item.id, type: item.type });
  };

  // Primeiro destaque com imagem de fundo (fallback: primeiro item)
  const featured = page?.items.find((item) => item.background) ?? page?.items[0] ?? null;

  // Seções exclusivas dos addons habilitados — entram após as 2 primeiras curadas
  const addonSections = useMemo(() => externalCatalogSections(addons), [addons]);
  const sections: { key: string; props: UI.MediaSectionProps }[] = [
    ...HOME_SECTIONS.slice(0, 2).map((props, i) => ({ key: `curated-${i}`, props })),
    ...addonSections.map((section) => ({
      key: section.key,
      props: {
        title: section.title,
        kind: section.kind,
        list: section.list,
        sources: [section.baseUrl],
        source: section.addonName,
      },
    })),
    ...HOME_SECTIONS.slice(2).map((props, i) => ({ key: `curated-${i + 2}`, props })),
  ];

  return (
    <section aria-label="Conteúdo">
      {error ? (
        <ErrorAlert message={`Não foi possível carregar o destaque: ${error}`} onRetry={retry} />
      ) : (
        <Billboard item={featured} loading={loading} />
      )}

      <div className="mt-8 space-y-8">
        {sections.map(({ key, props }) => (
          <MediaSection key={key} {...props} onSelect={openDetail} />
        ))}
      </div>
    </section>
  );
};

export default HomeRoute;
