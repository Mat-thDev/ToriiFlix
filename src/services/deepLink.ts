/** Esquemas de deep link aceitos (o `stremio` existe para herdar links de addons). */
const SCHEME_RE = /^(torii|stremio|https?):\/\//i;

const CUSTOM_SCHEME_RE = /^(torii|stremio):$/i;

/**
 * Converte um deep link na URL base http(s) do addon (sem `/manifest.json`).
 *
 * `torii://host/caminho` e `stremio://host/caminho` viram `https://host/caminho`
 * (mesma convenção do Stremio); `http(s)://` passa adiante intacto. Qualquer
 * outro esquema, host ausente ou credenciais na URL retornam `null` — a entrada
 * é tratada como não confiável e nunca chega ao fetch.
 *
 * A validação roda sobre a URL **original**: reescrever `torii:///x` para
 * `https:///x` faria o parser do WHATWG absorver o authority vazio e apontar o
 * host para `x`.
 */
export const toManifestUrl = (raw: string): string | null => {
  const trimmed = raw.trim();
  const match = SCHEME_RE.exec(trimmed);
  if (!match) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (!url.hostname || url.username || url.password) return null;

  const base = CUSTOM_SCHEME_RE.test(url.protocol)
    ? `https://${trimmed.slice(match[0].length)}`
    : trimmed;

  return base
    .replace(/\/manifest\.json\/?$/i, "")
    .replace(/\/+$/, "");
};
