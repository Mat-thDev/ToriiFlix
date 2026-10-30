/** `resources` do manifest pode vir como string ou objeto { name }. */
export const resourceNames = (resources: Stremio.Manifest["resources"]): string[] =>
  resources.map((r) => (typeof r === "string" ? r : r.name));

/** Verifica se o addon serve um recurso do protocolo (ex.: "catalog"). */
export const hasResource = (resources: Stremio.Manifest["resources"], name: string): boolean =>
  resourceNames(resources).includes(name);
