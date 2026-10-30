/** Addons embutidos (seeds). Demais addons entram pela Settings (useAddons). */

/** Catálogo/meta padrão (DOSSIE §4.6 — protocolo público, sem chave). */
export const CINEMETA: Stremio.BuiltinAddon = {
  id: "cinemeta",
  name: "Cinemeta",
  baseUrl: "https://v3-cinemeta.strem.io",
  resources: ["catalog", "meta"],
};

export const BUILTIN_ADDONS: Stremio.BuiltinAddon[] = [CINEMETA];
