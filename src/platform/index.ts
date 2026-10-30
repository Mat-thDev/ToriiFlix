import { isTauri } from "@tauri-apps/api/core";
import { atom } from "jotai";

/**
 * Runtime Tauri — detecta por `__TAURI_INTERNALS__` (ponte de IPC injetada no
 * webview) ou pelo global `isTauri` oficial. Nunca usar só `__TAURI__`
 * (`withGlobalTauri` é opcional e está desabilitado).
 */
export const isTauriRuntime = (): boolean =>
  "__TAURI_INTERNALS__" in window ||
  typeof (globalThis as Platform.TauriGlobal).isTauri === "function";

/**
 * webOS (LG TV) — UA real: `Mozilla/5.0 (Web0S; Linux/SmartTV) ...` (nota:
 * "Web0S" com zero). `PalmSystem` é o runtime do app empacotado. `?tv` força
 * o modo TV no browser para teste.
 */
const isWebOS = (): boolean =>
  /Web0S/i.test(navigator.userAgent) ||
  "PalmSystem" in window ||
  new URLSearchParams(window.location.search).has("tv");

export const detectPlatform = (): Platform.Id => {
  if (isTauri() || isTauriRuntime()) return "tauri";
  if (isWebOS()) return "webos";
  return "web";
};

export const platform: Platform.Id = detectPlatform();

/** True quando roda no webOS (modo 10-foot). */
export const isTV = platform === "webos";

/** Estado da plataforma acessível de qualquer componente via Jotai. */
export const platformAtom = atom<Platform.Id>(platform);
export const isDesktopAtom = atom((get) => get(platformAtom) !== "webos");

/**
 * Marca a plataforma no DOM:
 * - `<html data-platform="tauri|webos|web">` + classe `platform-<x>`
 * - `<body class="tv">` quando webOS (modo 10-foot, cf. DOSSIE)
 */
export const applyPlatformClass = (): void => {
  const root = document.documentElement;
  root.dataset.platform = platform;
  root.classList.add(`platform-${platform}`);
  document.body.classList.toggle("tv", isTV);
};
