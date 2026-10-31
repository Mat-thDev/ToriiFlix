import { useState } from "react";
import { Film } from "lucide-react";
import useSeason from "../../../hooks/useSeason";
import { formatDate, formatRuntime } from "../../../utils/format";
import { FocusButton } from "../../ui/FocusButton";
import { ErrorAlert } from "../../ui/ErrorAlert";

/**
 * Seção de temporadas/episódios (séries) — botões de temporada focáveis
 * e lista de episódios carregada sob demanda (useSeason). Episódios são
 * exibição por enquanto: player em breve.
 */
const SeasonsSection = ({ details, language }: UI.SeasonsSectionProps) => {
  const [seasonNumber, setSeasonNumber] = useState<number | undefined>(details.seasons[0]?.number);
  const { episodes, loading, error, retry } = useSeason(details.tmdbId, seasonNumber, true);

  if (details.seasons.length === 0) return null;

  return (
    <section aria-label="Temporadas">
      <h2 className="mb-4">Temporadas & episódios</h2>

      <div className="flex flex-wrap gap-2">
        {details.seasons.map((season) => (
          <FocusButton
            key={season.number}
            type="button"
            aria-pressed={seasonNumber === season.number}
            onClick={() => setSeasonNumber(season.number)}
            className={`btn btn-sm ${seasonNumber === season.number ? "btn-primary" : "btn-outline"}`}
          >
            {season.name ?? `Temporada ${season.number}`}
            {season.episodeCount !== undefined && (
              <span className="opacity-60"> · {season.episodeCount} ep.</span>
            )}
          </FocusButton>
        ))}
      </div>

      <div className="mt-4 max-w-3xl">
        {error && <ErrorAlert message={`Não foi possível carregar os episódios: ${error}`} onRetry={retry} />}

        {loading && (
          <div aria-busy="true" className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-16 w-28 shrink-0 animate-pulse rounded-lg bg-base-content/10" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-base-content/10" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-base-content/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && (
          <ol className="space-y-2">
            {episodes.map((episode) => (
              <li
                key={episode.number}
                className="flex gap-3 rounded-xl bg-base-200/60 p-3 ring-1 ring-base-content/5"
              >
                {episode.still ? (
                  <img
                    src={episode.still}
                    alt=""
                    loading="lazy"
                    className="h-16 w-28 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-lg bg-base-content/10">
                    <Film className="size-5 text-base-content/25" aria-hidden="true" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-semibold">
                      <span className="text-base-content/50">{episode.number}. </span>
                      {episode.name ?? `Episódio ${episode.number}`}
                    </p>
                    <span className="shrink-0 text-xs text-base-content/50">
                      {[
                        formatRuntime(episode.runtime),
                        formatDate(episode.airDate, language),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>

                  {episode.overview && (
                    <p className="mt-1 line-clamp-2 text-xs text-base-content/60">
                      {episode.overview}
                    </p>
                  )}
                </div>
              </li>
            ))}
            {episodes.length === 0 && (
              <li className="text-sm text-base-content/50">Nenhum episódio encontrado.</li>
            )}
          </ol>
        )}
      </div>
    </section>
  );
};

export default SeasonsSection;
