import { useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { toast } from "react-toastify";
import { modalsAtom } from "../atoms/modals";
import { isTauriRuntime } from "../platform";
import { toManifestUrl } from "../services/deepLink";

/** Janela em que `getCurrent` e `onOpenUrl` podem entregar o mesmo link. */
const DEDUPE_MS = 3_000;

/**
 * Recebe `torii://…` / `stremio://…` e abre a confirmação de instalação do addon.
 * Fora do runtime Tauri (web, webOS) é no-op: nenhum sistema desses alvos
 * permite registrar um protocolo custom.
 *
 * No Windows/Linux o link chega como argumento de um processo novo, repassado
 * ao que já está aberto pelo `single-instance` — `getCurrent` cobre o arranque
 * a frio e `onOpenUrl` os links com o app rodando.
 */
const useDeepLink = () => {
  const setModals = useSetAtom(modalsAtom);
  const lastRef = useRef<{ url: string; at: number } | null>(null);

  useEffect(() => {
    if (!isTauriRuntime()) return;

    let disposed = false;
    let unlisten: (() => void) | undefined;

    const handle = (urls: string[]) => {
      const raw = urls[0];
      if (!raw) return;

      const now = Date.now();
      if (lastRef.current?.url === raw && now - lastRef.current.at < DEDUPE_MS) return;
      lastRef.current = { url: raw, at: now };

      const manifestUrl = toManifestUrl(raw);
      if (!manifestUrl) {
        toast.error("Link de addon inválido.");
        return;
      }

      setModals({ modal: "AddonInstall", props: { manifestUrl } });
    };

    void onOpenUrl(handle).then((fn) => {
      if (disposed) fn();
      else unlisten = fn;
    });

    void getCurrent()
      .then((urls) => {
        if (!disposed && urls) handle(urls);
      })
      .catch(() => {});

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [setModals]);
};

export default useDeepLink;
