import { useCallback, useState } from "react";

const STORAGE_KEY = "torii:search-history";
const MAX_ITEMS = 8;

const read = (): string[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((term): term is string => typeof term === "string");
  } catch {
    return [];
  }
};

const write = (terms: string[]): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(terms));
  } catch {
    // storage cheio/indisponivel (modo privado) — historico vira volatil
  }
};

/**
 * Historico de buscas persistido em localStorage (cap 8, dedupe
 * case-insensitive, mais recente primeiro). Volatil se o storage falhar.
 */
const useSearchHistory = () => {
  const [terms, setTerms] = useState<string[]>(read);

  const add = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setTerms((prev) => {
      const key = trimmed.toLowerCase();
      const next = [trimmed, ...prev.filter((t) => t.toLowerCase() !== key)];
      const capped = next.slice(0, MAX_ITEMS);
      write(capped);
      return capped;
    });
  }, []);

  return { terms, add };
};

export default useSearchHistory;
