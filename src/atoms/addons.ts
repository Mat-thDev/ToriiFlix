import { atomWithStorage } from "jotai/utils";

/**
 * Addons externos instalados pelo usuário (persistidos em localStorage).
 * A leitura tolera payload corrompido — volta para a lista vazia.
 */
export const addonsAtom = atomWithStorage<Stremio.ExternalAddon[]>("addons", [], {
  getItem: (key) => {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return [];

    try {
      const saved = JSON.parse(raw);
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  },
  setItem: (key, value) => window.localStorage.setItem(key, JSON.stringify(value)),
  removeItem: (key) => window.localStorage.removeItem(key),
});
