import { atomWithStorage } from "jotai/utils";

export const navigationAtom = atomWithStorage<Nav.NavState>("nav", {
  current: { page: "Home" },
  stack: [],
});
