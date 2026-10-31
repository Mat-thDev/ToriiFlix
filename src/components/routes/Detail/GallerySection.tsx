/**
 * Seção de galeria — backdrops do TMDB em linha horizontal. Estática
 * (sem ação); imagens carregam sob demanda.
 */
const GallerySection = ({ backdrops }: UI.GallerySectionProps) => {
  if (backdrops.length === 0) return null;

  return (
    <section aria-label="Galeria">
      <h2 className="mb-4">Galeria</h2>

      <ul className="flex gap-3 overflow-x-auto pb-2">
        {backdrops.map((url, i) => (
          <li key={`${url}-${i}`} className="shrink-0">
            <img
              src={url}
              alt=""
              loading="lazy"
              className="h-40 rounded-xl object-cover ring-1 ring-base-content/10"
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default GallerySection;
