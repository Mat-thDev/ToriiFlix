import { atomWithStorage } from "jotai/utils";

export const historyAtom = atomWithStorage<Media.MediaHistory[]>("history", []);
