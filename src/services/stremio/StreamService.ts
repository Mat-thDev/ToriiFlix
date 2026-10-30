import { CINEMETA } from "./builtinAddons";
import { getStreams } from "./StremioClient";

/** Streams de um item via addon embutido — base para a fase de player. */
export const listStreams = (
  type: Media.Kind,
  id: string,
  signal?: AbortSignal,
): Promise<Stremio.StreamResponse> => getStreams(CINEMETA.baseUrl, type, id, signal);
