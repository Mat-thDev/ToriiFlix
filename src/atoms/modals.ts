import { atom } from "jotai";

export const modalsAtom = atom<Modals.ModalState>({
  modal: null,
  props: {}  
})