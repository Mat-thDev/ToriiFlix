import { atomWithStorage } from "jotai/utils";

/** Valores padrão — usados no primeiro boot e em chaves corrompidas do storage. */
export const DEFAULT_SETTINGS: AppSettings.Settings = {
    playback: {
        autoSubtitles: true,
        maxQuality: "auto",
        skipIntros: false,
    },
    appearance: {
        theme: "torii",
        animations: true,
        cardDensity: "comfortable",
        sidebarMode: "always",
        windowControls: true,
    },
    system: {
        language: "pt-BR",
        startWithSystem: false,
    },
    addons: {
        tmdbApiKey: ""
    }
};

/**
 * Configurações persistidas em localStorage por seção.
 * O getItem mescla o payload salvo com os defaults: settings novas ganham
 * valor padrão para usuários com storage antigo.
 */
export const settingsAtom = atomWithStorage<AppSettings.Settings>("settings", DEFAULT_SETTINGS, {
    getItem: (key) => {
        const raw = window.localStorage.getItem(key);
        if (raw === null) return DEFAULT_SETTINGS;

        try {
            const saved = JSON.parse(raw) as Partial<AppSettings.Settings>;
            return {
                playback: { ...DEFAULT_SETTINGS.playback, ...saved.playback },
                appearance: { ...DEFAULT_SETTINGS.appearance, ...saved.appearance },
                system: { ...DEFAULT_SETTINGS.system, ...saved.system },
                addons: { ...DEFAULT_SETTINGS.addons, ...saved.addons }
            };
        } catch {
            return DEFAULT_SETTINGS;
        }
    },
    setItem: (key, value) => window.localStorage.setItem(key, JSON.stringify(value)),
    removeItem: (key) => window.localStorage.removeItem(key),
});
