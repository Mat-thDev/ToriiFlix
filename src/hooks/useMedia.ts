import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { addonsAtom } from "../atoms/addons";
import { catalogSources, getMedia } from "../services/stremio/CatalogService";

/**
 * Meta de um item (movie/series) nos addons habilitados, com loading/erro/retry.
 * Mesmo padrão do useCatalog: abort no unmount, erros pós-abort ignorados.
 */
const useMedia = (kind: Media.Kind | undefined, id: string | undefined) => {
  const addons = useAtomValue(addonsAtom);
  const sources = useMemo(() => catalogSources(addons), [addons]);
  const [state, setState] = useState<Hooks.MediaState>({
    item: null,
    loading: true,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!kind || !id) {
      setState({ item: null, loading: false, error: "Item inválido" });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    getMedia(kind, id, { sources, signal: controller.signal })
      .then((item) => {
        if (controller.signal.aborted) return;
        if (item) setState({ item, loading: false, error: null });
        else setState({ item: null, loading: false, error: "Item não encontrado" });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          item: null,
          loading: false,
          error: error instanceof Error ? error.message : String(error),
        });
      });

    return () => controller.abort();
  }, [kind, id, sources, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
};

export default useMedia;
