import { useCallback } from "react";
import { useAtom } from "jotai";
import { addonsAtom } from "../atoms/addons";
import { getManifest, StremioError } from "../services/stremio/StremioClient";

/** Normaliza a URL de manifest para a chave canônica do addon (base sem sufixo). */
const toBaseUrl = (manifest: string): string =>
  manifest.replace(/\/manifest\.json\/?$/, "").replace(/\/$/, "");

/**
 * Instalação e gestão de addons externos (persistidos em localStorage).
 * `add` lança StremioError/Error em falha de rede, manifest inválido ou
 * duplicata — o consumidor decide como exibir.
 */
const useAddons = () => {
  const [addons, setAddons] = useAtom(addonsAtom);

  const add = useCallback(
    async (manifest: string, manifestData?: Stremio.Manifest) => {
      if (!manifest) return;

      const baseUrl = toBaseUrl(manifest);
      const data = manifestData ?? (await getManifest(baseUrl));

      if (!data.id || !data.name || !Array.isArray(data.resources)) {
        throw new StremioError("Manifest inválido: id, name e resources são obrigatórios", baseUrl);
      }

      if (addons.some((a) => a.manifest.id === data.id)) {
        throw new Error(`Addon "${data.name}" já está instalado`);
      }

      setAddons([...addons, { url: baseUrl, manifest: data, enabled: true }]);
    },
    [addons, setAddons],
  );

  const remove = useCallback(
    (url: string) => {
      if (!url) return;
      setAddons(addons.filter((a) => a.url !== url));
    },
    [addons, setAddons],
  );

  const setEnabled = useCallback(
    (url: string, enabled: boolean) => {
      if (!url) return;
      setAddons(addons.map((a) => (a.url === url ? { ...a, enabled } : a)));
    },
    [addons, setAddons],
  );

  return { addons, add, remove, setEnabled };
};

export default useAddons;
