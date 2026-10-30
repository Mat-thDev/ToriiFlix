import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { addonsAtom } from "../atoms/addons";
import { catalogSources, listCatalog } from "../services/stremio/CatalogService";

/**
 * Catálogo dos addons habilitados (built-in + externos com `catalog`)
 * com loading/erro/retry. Abort no unmount (erros pós-abort sao ignorados).
 * Sem cache entre consumidores — reintroduzir react-query com 2o consumidor.
 */
const useCatalog = (kind: Media.Kind, params: Hooks.CatalogParams = {}) => {
  const { list = "top", genre, limit = 30, sources: paramSources } = params;
  const addons = useAtomValue(addonsAtom);
  const addonSources = useMemo(() => catalogSources(addons), [addons]);
  const sources = paramSources ?? addonSources;
  const [state, setState] = useState<Hooks.CatalogState>({
    page: null,
    loading: true,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    listCatalog(kind, { list, genre, limit, sources, signal: controller.signal })
      .then((page) => {
        if (!controller.signal.aborted) setState({ page, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          page: null,
          loading: false,
          error: error instanceof Error ? error.message : String(error),
        });
      });

    return () => controller.abort();
  }, [kind, list, genre, limit, sources, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
};

export default useCatalog;
