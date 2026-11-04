import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { toast } from "react-toastify";
import useAddons from "../../hooks/useAddons";
import useModals from "../../hooks/useModals";
import { getManifest, StremioError } from "../../services/stremio/StremioClient";
import { resourceNames } from "../../services/stremio/resources";
import { FocusButton } from "../ui/FocusButton";
import { ErrorAlert } from "../ui/ErrorAlert";

/**
 * Confirmação de instalação vinda de um deep link (`torii://…`).
 * Busca o manifest para exibir o que será instalado — nada é salvo sem o
 * usuário confirmar.
 */
const AddonInstallModal = ({ manifestUrl }: Modals.PropsMap["AddonInstall"]) => {
  const { addons, add } = useAddons();
  const { closeModal } = useModals();

  const [manifest, setManifest] = useState<Stremio.Manifest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setManifest(null);
    setLoadError(null);
    setInstallError(null);

    getManifest(manifestUrl, controller.signal)
      .then((data) => {
        if (!data.id || !data.name || !Array.isArray(data.resources)) {
          throw new StremioError("Manifest inválido: id, name e resources são obrigatórios", manifestUrl);
        }
        setManifest(data);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setLoadError(error instanceof Error ? error.message : String(error));
      });

    return () => controller.abort();
  }, [manifestUrl]);

  const alreadyInstalled = !!manifest && addons.some((a) => a.manifest.id === manifest.id);

  const install = async () => {
    if (!manifest || installing || alreadyInstalled) return;

    setInstalling(true);
    setInstallError(null);
    try {
      await add(manifestUrl, manifest);
      closeModal();
      toast.success(`Addon "${manifest.name}" instalado.`);
    } catch (error) {
      setInstallError(error instanceof Error ? error.message : String(error));
    } finally {
      setInstalling(false);
    }
  };

  if (loadError) {
    return (
      <div className="space-y-4 p-6 pr-12">
        <h2 className="text-lg font-bold">Instalar addon</h2>
        <ErrorAlert message={`Não foi possível ler o manifest: ${loadError}`} />
        <p className="break-all text-xs text-base-content/50">{manifestUrl}</p>
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="flex items-center gap-3 p-6 pr-12" aria-busy="true">
        <span className="loading loading-spinner loading-md" />
        <span className="text-sm text-base-content/60">Lendo manifest…</span>
      </div>
    );
  }

  const resources = resourceNames(manifest.resources);

  return (
    <div className="space-y-4 p-6 pr-12">
      <div className="flex items-center gap-4">
        {manifest.logo ? (
          <img src={manifest.logo} alt="" loading="lazy" className="size-14 shrink-0 rounded-full bg-base-content/10 object-cover" />
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-base-content/10">
            <Package className="size-6 text-base-content/40" aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold" title={manifest.name}>
            {manifest.name}
          </h2>
          <p className="truncate text-xs text-base-content/50" title={manifest.id}>
            {manifest.id} · v{manifest.version}
          </p>
        </div>
      </div>

      <dl className="space-y-2 rounded-xl border border-base-content/10 bg-base-content/5 p-3 text-sm">
        <div className="flex gap-3">
          <dt className="w-24 shrink-0 text-xs font-bold tracking-widest text-base-content/50 uppercase">Tipos</dt>
          <dd className="min-w-0 break-words">{manifest.types.join(", ") || "—"}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-24 shrink-0 text-xs font-bold tracking-widest text-base-content/50 uppercase">Recursos</dt>
          <dd className="min-w-0 break-words">{resources.join(", ") || "—"}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-24 shrink-0 text-xs font-bold tracking-widest text-base-content/50 uppercase">Catálogos</dt>
          <dd className="min-w-0 break-words">{manifest.catalogs.length}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-24 shrink-0 text-xs font-bold tracking-widest text-base-content/50 uppercase">Origem</dt>
          <dd className="min-w-0 break-all text-xs text-base-content/60">{manifestUrl}</dd>
        </div>
      </dl>

      {installError && <ErrorAlert message={installError} />}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <FocusButton type="button" onClick={closeModal} disabled={installing} className="btn btn-ghost btn-sm">
          Cancelar
        </FocusButton>
        <FocusButton
          type="button"
          onClick={() => void install()}
          disabled={installing || alreadyInstalled}
          className="btn btn-primary btn-sm"
        >
          <Package className="size-4" aria-hidden="true" />
          {alreadyInstalled ? "Já instalado" : installing ? "Instalando…" : "Instalar"}
        </FocusButton>
      </div>
    </div>
  );
};

export default AddonInstallModal;
