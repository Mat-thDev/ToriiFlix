import { atom } from "jotai";

/** Pilha de navegação — página atual + histórico (máx. 15 entradas). */
export const navigationAtom = atom<Nav.NavState>({
  current: { page: "Home" },
  stack: [],
});
