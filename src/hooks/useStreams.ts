import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { addonsAtom } from "../atoms/addons";
import { listStreams, streamSources } from "../services/stremio/StreamService";

const INITIAL_STATE: Hooks.StreamsState = {
  streams: [],
  loading: true,
  error: null,
};


const useStreams = (kind: Media.Kind | undefined, id: string | undefined, episode?: Media.EpisodeRef) => {
  const addons = useAtomValue(addonsAtom);
  const sources = useMemo(() => streamSources(addons), [addons]);
  const [state, setState] = useState<Hooks.StreamsState>(INITIAL_STATE);
  const [attempt, setAttempt] = useState(0);

  const season = episode?.season;
  const number = episode?.number;

  useEffect(() => {
    if (!kind || !id) {
      setState({ ...INITIAL_STATE, loading: false, error: "Item inválido" });
      return;
    }
    // Nenhum addon de stream habilitado: estado vazio, sem request
    if (sources.length === 0) {
      setState({ streams: [], loading: false, error: null });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const ep = season !== undefined && number !== undefined ? { season, number } : undefined;

    listStreams(kind, id, { sources, episode: ep, signal: controller.signal })
      .then((streams) => {
        if (!controller.signal.aborted) setState({ streams, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          streams: [],
          loading: false,
          error: error instanceof Error ? error.message : String(error),
        });
      });

    return () => controller.abort();
  }, [kind, id, season, number, sources, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
};

export default useStreams;
