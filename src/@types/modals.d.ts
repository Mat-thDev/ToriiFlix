declare namespace Modals {
  /** Chaves de modal registradas em `components/modals/index.tsx`. */
  type ModalsKeys = "StreamSelector";

  /** Props de cada modal — mesma chave de `ModalsKeys`. */
  interface PropsMap {
    StreamSelector: {
      id?: string;
      type?: Media.Kind;
      item?: Media.Item;
      details?: Media.Details | null;
    };
  }

  interface ModalState {
    modal: ModalsKeys | null;
    props?: PropsMap[ModalsKeys];
  }
}
