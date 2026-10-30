import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { addonsAtom } from "../atoms/addons";
import { catalogSources, searchCatalog } from "../services/stremio/CatalogService";

/** Debounce da busca enquanto o usuario digita. */
const DEBOUNCE_MS = 350;

/** Termo minimo antes de consultar a API. */
const MIN_QUERY_LENGTH = 2;

/**
 * Busca no Cinemeta com debounce, loading/erro/retry e abort no unmount.
 * Mesmo padrao do useCatalog/useMedia. Termo curto limpa os resultados.
 */
const useSearch = (query: string) => {
  const addons = useAtomValue(addonsAtom);
  const sources = useMemo(() => catalogSources(addons), [addons]);
  const [state, setState] = useState<Hooks.SearchState>({
    items: [],
    loading: false,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);
  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setState({ items: [], loading: false, error: null });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const timer = window.setTimeout(() => {
      searchCatalog(trimmed, { limit: 20, sources, signal: controller.signal })
        .then((page) => {
          if (controller.signal.aborted) return;
          setState({ items: page.items, loading: false, error: null });
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setState({
            items: [],
            loading: false,
            error: error instanceof Error ? error.message : String(error),
          });
        });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, sources, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
};

export default useSearch;
