import { useAtom } from "jotai";
import { modalsAtom } from "../atoms/modals";

const useModals = () => {
  const [modals, setModals] = useAtom(modalsAtom);

  const showModal = <K extends Modals.ModalsKeys>(modal: K, props?: Modals.PropsMap[K]) => {
    setModals({ modal, props });
  };

  const closeModal = () => {
    setModals({ modal: null, props: {} });
  };

  return {
    currentModal: modals.modal,
    currentProps: modals.props,
    showModal,
    closeModal,
  };
};

export default useModals;
