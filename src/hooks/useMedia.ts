import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { addonsAtom } from "../atoms/addons";
import { settingsAtom } from "../atoms/settings";
import { catalogSources, getMedia } from "../services/stremio/CatalogService";
import { enrichMediaDetails } from "../services/tmdb/tmdbDetails";

const INITIAL_STATE: Hooks.MediaState = {
  item: null,
  loading: true,
  error: null,
  details: null,
  detailsLoading: false,
};

/**
 * Meta de um item (movie/series) nos addons habilitados, com loading/erro/retry.
 * Mesmo padrão do useCatalog: abort no unmount, erros pós-abort ignorados.
 *
 * Segunda fase: com a API key do TMDB configurada, enriquece o Item com
 * `Media.Details` localizado no `settings.system.language` — a tela renderiza
 * o Item do addon antes e completa depois (TMDB nunca bloqueia nem quebra).
 */
const useMedia = (kind: Media.Kind | undefined, id: string | undefined) => {
  const addons = useAtomValue(addonsAtom);
  const settings = useAtomValue(settingsAtom);
  const tmdbApiKey = settings.addons.tmdbApiKey;
  const language = settings.system.language;
  const sources = useMemo(() => catalogSources(addons), [addons]);
  const [state, setState] = useState<Hooks.MediaState>(INITIAL_STATE);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!kind || !id) {
      setState({ ...INITIAL_STATE, loading: false, error: "Item inválido" });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    getMedia(kind, id, { sources, signal: controller.signal })
      .then((item) => {
        if (controller.signal.aborted) return;
        if (item) setState({ item, loading: false, error: null, details: null, detailsLoading: false });
        else setState({ ...INITIAL_STATE, loading: false, error: "Item não encontrado" });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          ...INITIAL_STATE,
          loading: false,
          error: error instanceof Error ? error.message : String(error),
        });
      });

    return () => controller.abort();
  }, [kind, id, sources, attempt]);

  // Fase 2 — enriquecimento TMDB (roda depois que o Item do addon chegou)
  const { item } = state;
  useEffect(() => {
    if (!item) return;

    const controller = new AbortController();
    setState((prev) => ({ ...prev, detailsLoading: true }));

    enrichMediaDetails(item, { apiKey: tmdbApiKey ?? "", language, signal: controller.signal })
      .then((details) => {
        if (controller.signal.aborted) return;
        setState((prev) => (prev.item === item ? { ...prev, details, detailsLoading: false } : prev));
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setState((prev) => (prev.item === item ? { ...prev, detailsLoading: false } : prev));
      });

    return () => controller.abort();
  }, [item, tmdbApiKey, language]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
};

export default useMedia;
