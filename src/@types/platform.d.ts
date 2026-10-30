/**
 * Tipagens de plataforma/runtime.
 * Uso: `Platform.Id`, `Platform.TauriGlobal`, ...
 */
declare namespace Platform {
  /** Ambiente de runtime detectado no boot (ver `src/platform/index.ts`). */
  type Id = "tauri" | "webos" | "web";

  /** Global injetado pelo Tauri no webview (`isTauri` + internals). */
  type TauriGlobal = typeof globalThis & { isTauri?: unknown };
}
