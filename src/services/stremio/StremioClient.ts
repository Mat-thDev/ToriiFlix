/**
 * Cliente do Stremio Addon Protocol — puro, sem React (a UI nunca
 * fala HTTP de addon direto; ver DOSSIE §4).
 *
 * Endpoints do protocolo:
 *   /manifest.json
 *   /catalog/{type}/{id}({extra}).json
 *   /meta/{type}/{id}.json
 *   /stream/{type}/{id}.json
 *
 * Formato oficial dos extras (stremio-addon-sdk docs/protocol.md):
 * segmento de path com query-string serializada —
 *   /catalog/movie/top/genre=Action&skip=0.json
 * Sem parênteses, sem `?`. Extras fora desse formato são ignorados
 * silenciosamente pelo addon (verificado em v3-cinemeta.strem.io).
 */

const ALLOWED_PROTOCOL = /^https?:\/\//i;
const REQUEST_TIMEOUT_MS = 12_000;

export class StremioError extends Error {
  constructor(
    message: string,
    readonly url: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "StremioError";
  }
}

const buildUrl = (base: string, path: string): string => {
  const url = `${base.replace(/\/+$/, "")}/${path}`;
  if (!ALLOWED_PROTOCOL.test(url)) {
    throw new StremioError("URL fora da allowlist http(s)", url);
  }
  return url;
};

const encodeExtra = (extra: Stremio.Extra): string =>
  Object.entries(extra)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

const fetchJson = async <T>(url: string, external?: AbortSignal): Promise<T> => {
  if (!ALLOWED_PROTOCOL.test(url)) {
    throw new StremioError("URL fora da allowlist http(s)", url);
  }

  // Timeout proprio (AbortSignal.timeout exige Chrome 103+; alvo e mais antigo)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  external?.addEventListener("abort", onAbort);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new StremioError(`HTTP ${response.status}`, url, response.status);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (external?.aborted) throw error; // aborto de unmount: repassa cru
    if (error instanceof StremioError) throw error;
    if (controller.signal.aborted) {
      throw new StremioError(`timeout de ${REQUEST_TIMEOUT_MS / 1000}s`, url);
    }
    throw new StremioError(error instanceof Error ? error.message : String(error), url);
  } finally {
    clearTimeout(timer);
    external?.removeEventListener("abort", onAbort);
  }
};

export const getManifest = (base: string, signal?: AbortSignal): Promise<Stremio.Manifest> =>
  fetchJson<Stremio.Manifest>(buildUrl(base, "manifest.json"), signal);

export const getCatalog = (
  base: string,
  type: string,
  id: string,
  extra?: Stremio.Extra,
  signal?: AbortSignal,
): Promise<Stremio.CatalogResponse> => {
  // Extra vazio não gera segmento — /catalog/{type}/{id}.json
  const extraPart = extra && Object.keys(extra).length > 0 ? `/${encodeExtra(extra)}` : "";
  const path = `catalog/${encodeURIComponent(type)}/${encodeURIComponent(id)}${extraPart}.json`;
  return fetchJson<Stremio.CatalogResponse>(buildUrl(base, path), signal);
};

export const getMeta = (
  base: string,
  type: string,
  id: string,
  signal?: AbortSignal,
): Promise<Stremio.MetaResponse> =>
  fetchJson<Stremio.MetaResponse>(
    buildUrl(base, `meta/${encodeURIComponent(type)}/${encodeURIComponent(id)}.json`),
    signal,
  );

export const getStreams = (
  base: string,
  type: string,
  id: string,
  signal?: AbortSignal,
): Promise<Stremio.StreamResponse> =>
  fetchJson<Stremio.StreamResponse>(
    buildUrl(base, `stream/${encodeURIComponent(type)}/${encodeURIComponent(id)}.json`),
    signal,
  );
