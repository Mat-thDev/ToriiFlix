import { Film } from "lucide-react";
import { FocusButton } from "../../ui/FocusButton";

/**
 * Seção de relacionados — cards de pôster focáveis. O id é do TMDB; a
 * conversão para IMDb (formato dos addons) acontece no clique, na rota.
 */
const RelatedSection = ({ details, onSelect }: UI.RelatedSectionProps) => {
  if (details.related.length === 0) return null;

  return (
    <section aria-label="Relacionados">
      <h2 className="mb-4">Você também pode gostar</h2>

      <ul className="flex gap-4 overflow-x-auto pb-2">
        {details.related.map((related) => (
          <li key={related.tmdbId} className="w-40 shrink-0 md:w-44">
            <FocusButton
              type="button"
              onClick={() => onSelect(related)}
              aria-label={`${related.name}${related.year ? ` (${related.year})` : ""}`}
              className="group block w-full p-2 text-left"
            >
              <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-base-200 ring-1 ring-base-content/10 transition-shadow duration-200 group-hover:ring-2 group-hover:ring-primary group-data-focused:ring-2 group-data-focused:ring-primary">
                {related.poster ? (
                  <img
                    src={related.poster}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Film
                    className="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-base-content/20"
                    aria-hidden="true"
                  />
                )}
              </div>
              <p className="mt-2 truncate text-sm font-semibold">{related.name}</p>
              {related.year && <p className="text-xs text-base-content/50">{related.year}</p>}
            </FocusButton>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RelatedSection;
