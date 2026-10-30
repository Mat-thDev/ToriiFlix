import { hasResource } from "./resources";

const isKind = (type?: string): type is Media.Kind => type === "movie" || type === "series";

/**
 * Seções exclusivas dos addons habilitados — uma por entrada de
 * `manifest.catalogs` (apenas tipos movie/series). Instalou o addon,
 * a seção aparece; desativou/removido, some.
 */
export const externalCatalogSections = (addons: Stremio.ExternalAddon[]): Media.ExternalSection[] =>
  addons.flatMap((addon) => {
    if (!addon.enabled || !hasResource(addon.manifest.resources, "catalog")) return [];

    return addon.manifest.catalogs.flatMap((catalog) => {
      if (!isKind(catalog.type)) return [];

      return [
        {
          key: `${addon.manifest.id}:${catalog.type}:${catalog.id}`,
          title: catalog.name ?? catalog.id,
          addonName: addon.manifest.name,
          baseUrl: addon.url,
          kind: catalog.type,
          list: catalog.id,
        },
      ];
    });
  });
