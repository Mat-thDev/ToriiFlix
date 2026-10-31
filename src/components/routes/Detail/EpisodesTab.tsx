import { useState } from "react";
import { CirclePlay, Film } from "lucide-react";
import useSeason from "../../../hooks/useSeason";
import { formatDate, formatRuntime } from "../../../utils/format";
import { FocusButton } from "../../ui/FocusButton";
import { ErrorAlert } from "../../ui/ErrorAlert";

/**
 * Aba "Episódios" (séries) — coluna de temporadas à esquerda e lista de
 * episódios da temporada selecionada à direita, carregada sob demanda
 * (useSeason). Episódios são focáveis p/ percorrer a lista com o remote;
 * player em breve.
 */
const EpisodesTab = ({ details, language }: UI.EpisodesTabProps) => {
  const [seasonNumber, setSeasonNumber] = useState<number | undefined>(details.seasons[0]?.number);
  const { episodes, loading, error, retry } = useSeason(details.tmdbId, seasonNumber, true);

  if (details.seasons.length === 0) {
    return <p className="py-8 text-sm text-base-content/50">Nenhuma temporada disponível.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      {/* Temporadas */}
      <nav aria-label="Temporadas" className="flex flex-row gap-2 overflow-x-auto md:flex-col md:overflow-visible">
        {details.seasons.map((season) => {
          const active = seasonNumber === season.number;
          return (
            <FocusButton
              key={season.number}
              type="button"
              aria-pressed={active}
              onClick={() => setSeasonNumber(season.number)}
              className={`shrink-0 rounded-lg px-4 py-3 text-left transition-colors md:w-full ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-base-content/70 hover:bg-base-content/5"
              }`}
            >
              <span className="block text-sm font-semibold">
                {season.name ?? `Temporada ${season.number}`}
              </span>
              {season.episodeCount !== undefined && (
                <span className="block text-xs opacity-60">{season.episodeCount} episódios</span>
              )}
            </FocusButton>
          );
        })}
      </nav>

      {/* Episódios */}
      <div className="min-w-0">
        {error && (
          <ErrorAlert message={`Não foi possível carregar os episódios: ${error}`} onRetry={retry} />
        )}

        {loading && (
          <div aria-busy="true" className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex gap-4 rounded-xl bg-base-200/60 p-3">
                <div className="h-24 w-44 shrink-0 animate-pulse rounded-lg bg-base-content/10" />
                <div className="flex-1 space-y-2 py-2">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-base-content/10" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-base-content/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && (
          <ol className="space-y-3">
            {episodes.map((episode) => (
              <li key={episode.number}>
                <FocusButton
                  type="button"
                  title="Player em breve"
                  aria-label={`Episódio ${episode.number}: ${episode.name ?? ""}`}
                  className="flex w-full gap-4 rounded-xl bg-base-200/60 p-3 text-left ring-1 ring-base-content/5 transition-shadow data-focused:ring-2 data-focused:ring-primary"
                >
                  <div className="relative h-24 w-44 shrink-0 overflow-hidden rounded-lg bg-base-content/10">
                    {episode.still ? (
                      <img
                        src={episode.still}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Film
                        className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-base-content/25"
                        aria-hidden="true"
                      />
                    )}
                    <CirclePlay
                      className="absolute top-1/2 left-1/2 size-9 -translate-x-1/2 -translate-y-1/2 text-white/80 drop-shadow"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      <span className="text-base-content/50">{episode.number}. </span>
                      {episode.name ?? `Episódio ${episode.number}`}
                    </p>
                    <p className="mt-0.5 text-xs text-base-content/50">
                      {[
                        formatRuntime(episode.runtime),
                        formatDate(episode.airDate, language),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {episode.overview && (
                      <p className="mt-1 line-clamp-2 text-xs text-base-content/60">
                        {episode.overview}
                      </p>
                    )}
                  </div>
                </FocusButton>
              </li>
            ))}
            {episodes.length === 0 && (
              <li className="text-sm text-base-content/50">Nenhum episódio encontrado.</li>
            )}
          </ol>
        )}
      </div>
    </div>
  );
};

export default EpisodesTab;
