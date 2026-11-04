declare namespace Modals {
  type ModalsKeys = "StreamSelector" | "AddonInstall";

  interface PropsMap {
    StreamSelector: {
      id?: string;
      type?: Media.Kind;
      item?: Media.Item;
      details?: Media.Details;
      episode?: Media.EpisodeRef
    };
    AddonInstall: {
      manifestUrl: string;
    };
  }

  interface ModalState {
    modal: ModalsKeys | null;
    props?: PropsMap[ModalsKeys];
  }
}
