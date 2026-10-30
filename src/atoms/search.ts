import { atom } from "jotai";

/**
 * Termo de busca persistido entre paginas — ao abrir um resultado e
 * voltar (goBack), a Search restaura o que o usuario digitava.
 */
export const searchQueryAtom = atom<string>("");
