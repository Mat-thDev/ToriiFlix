declare namespace Modals {
  type ModalsKeys = "StreamSelector";

  interface PropsMap {
    StreamSelector: {
      id?: string;
      type?: Media.Kind;
      item?: Media.Item;
      details?: Media.Details;
      episode?: Media.EpisodeRef
    };
  }

  interface ModalState {
    modal: ModalsKeys | null;
    props?: PropsMap[ModalsKeys];
  }
}
