import { useState } from "react";
import { Package, Trash2 } from "lucide-react";
import useAddons from "../../../../hooks/useAddons";
import { BUILTIN_ADDONS } from "../../../../services/stremio/builtinAddons";
import { resourceNames } from "../../../../services/stremio/resources";
import { SettingsGroup } from "../../../ui/SettingsGroup";
import { SettingsRow } from "../../../ui/SettingsRow";
import { Toggle } from "../../../ui/Toggle";
import { Input } from "../../../ui/Input";
import { FocusButton } from "../../../ui/FocusButton";

type Feedback = { kind: "success" | "error"; text: string } | null;

/** Aba Addons — built-ins (somente leitura) + externos via useAddons. */
const AddonsTab = () => {
  const { addons, add, remove, setEnabled } = useAddons();
  const [manifestUrl, setManifestUrl] = useState("");
  const [installing, setInstalling] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const install = async () => {
    const url = manifestUrl.trim();
    if (!url || installing) return;

    setFeedback(null);
    setInstalling(true);
    try {
      await add(url);
      setManifestUrl("");
      setFeedback({ kind: "success", text: "Addon instalado com sucesso." });
    } catch (error) {
      setFeedback({ kind: "error", text: error instanceof Error ? error.message : String(error) });
    } finally {
      setInstalling(false);
    }
  };

  return (
    <>
      <SettingsGroup title="Embutidos">
        {BUILTIN_ADDONS.map((addon) => (
          <SettingsRow
            key={addon.id}
            title={addon.name}
            description={`${addon.baseUrl} · ${addon.resources.join(", ")}`}
            control={<span className="badge badge-primary badge-outline">Embutido</span>}
          />
        ))}
      </SettingsGroup>

      <SettingsGroup title="Instalados">
        {addons.length === 0 ? (
          <p className="py-3 text-sm text-base-content/50">
            Nenhum addon instalado. Cole uma URL de manifest abaixo.
          </p>
        ) : (
          addons.map((addon) => (
            <div className="w-full flex items-center gap-4">
              <div>
                {addon.manifest.logo && (
                  <img
                    src={addon.manifest.logo ?? null}
                    className="max-w-12 rounded-full"
                  />
                )}
              </div>
              <SettingsRow
                key={addon.url}
                title={addon.manifest.name}
                description={`${addon.url.slice(0, 40)} · ${resourceNames(addon.manifest.resources).join(", ")}`}
                control={
                  <div className="flex items-center gap-3">
                    <Toggle
                      label={`Ativar ${addon.manifest.name}`}
                      checked={addon.enabled}
                      onChange={(on) => setEnabled(addon.url, on)}
                    />
                    <FocusButton
                      type="button"
                      aria-label={`Remover ${addon.manifest.name}`}
                      title="Remover"
                      onClick={() => remove(addon.url)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-base-content/40 transition-colors hover:bg-error/15 hover:text-error"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </FocusButton>
                  </div>
                }
              />
            </div>
          ))
        )}
      </SettingsGroup>

      <SettingsGroup title="Instalar">
        <SettingsRow
          title="URL do manifest"
          description="Ex.: https://addon.example.com/manifest.json"
          control={
            <div className="flex w-full max-w-md items-center gap-2">
              <Input
                aria-label="URL do manifest"
                value={manifestUrl}
                placeholder="https://…"
                disabled={installing}
                onChange={(e) => setManifestUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void install();
                }}
                className="rounded-lg border border-base-content/15 bg-base-content/5 px-3 py-2 text-sm placeholder:text-base-content/40"
              />
              <FocusButton
                type="button"
                disabled={installing || !manifestUrl.trim()}
                onClick={() => void install()}
                className="btn btn-primary btn-sm"
              >
                <Package className="size-4" aria-hidden="true" />
                {installing ? "Instalando…" : "Instalar"}
              </FocusButton>
            </div>
          }
        />

        {feedback && (
          <p
            role={feedback.kind === "error" ? "alert" : "status"}
            className={feedback.kind === "error" ? "py-3 text-sm text-error" : "py-3 text-sm text-success"}
          >
            {feedback.text}
          </p>
        )}
      </SettingsGroup>
    </>
  );
};

export default AddonsTab;
