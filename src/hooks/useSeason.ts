import { useCallback, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { settingsAtom } from "../atoms/settings";
import { getSeasonEpisodes } from "../services/tmdb/tmdbDetails";

const INITIAL: Hooks.SeasonState = { episodes: [], loading: false, error: null };

/**
 * Episódios de uma temporada do TMDB — carregados sob demanda ao escolher
 * a temporada na tela de detalhe. Abort no unmount; sem API key fica ocioso.
 */
const useSeason = (
  tmdbId: number | undefined,
  seasonNumber: number | undefined,
  enabled: boolean,
) => {
  const settings = useAtomValue(settingsAtom);
  const [state, setState] = useState<Hooks.SeasonState>(INITIAL);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled || !tmdbId || !seasonNumber) {
      setState(INITIAL);
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    getSeasonEpisodes(tmdbId, seasonNumber, {
      apiKey: settings.addons.tmdbApiKey ?? "",
      language: settings.system.language,
      signal: controller.signal,
    })
      .then((episodes) => {
        if (controller.signal.aborted) return;
        if (episodes.length > 0) setState({ episodes, loading: false, error: null });
        else setState({ episodes: [], loading: false, error: "Nenhum episódio encontrado" });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          episodes: [],
          loading: false,
          error: error instanceof Error ? error.message : String(error),
        });
      });

    return () => controller.abort();
  }, [tmdbId, seasonNumber, enabled, settings.addons.tmdbApiKey, settings.system.language, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
};

export default useSeason;
