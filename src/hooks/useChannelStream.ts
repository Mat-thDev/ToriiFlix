import { useState, useMemo, useEffect, useCallback } from "react";
import useStreams from "./useStreams";

/**
 * Streams de um canal. `kind` é o tipo real do item vindo do catálogo
 * ("channel" ou "tv") — addons declaram um ou outro; default "channel".
 */
const useChannelStream = (channelId?: string, kind: Media.Kind = "channel") => {
    const { streams, loading, error, retry } = useStreams(kind, channelId);
    const [index, setIndex] = useState(0);

    const playable = useMemo(
        () => (loading ? [] : streams.filter((s) => s.url && !s.torrentOnly)),
        [streams, loading],
    );

    useEffect(() => setIndex(0), [playable]);

    const next = useCallback(() => setIndex((i) => i + 1), []);

    return {
        stream: playable[index] ?? null,
        loading,
        unavailable: !loading && (!!error || index >= playable.length),
        next,
        retry,
    };
};

export default useChannelStream;