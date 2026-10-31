import { useEffect } from "react";
import type { ComponentType } from "react";
import { X } from "lucide-react";
import useModals from "../../hooks/useModals";
import { isBackEvent } from "../../platform/input";
import { FocusButton } from "../ui/FocusButton";
import { FocusSection } from "../ui/FocusSection";
import StreamListModal from "./StreamListModal";

const MODAL_MAPPING: Record<Modals.ModalsKeys, ComponentType<any>> = {
  StreamSelector: StreamListModal,
};

const ModalProvider = () => {
  const { currentModal, currentProps, closeModal } = useModals();

  // Esc/Backspace/voltar fecha o modal sem popar a rota atrás (mesmo
  // capture-phase do WhosWatching — vence o useBackNavigation global).
  useEffect(() => {
    if (!currentModal) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || !isBackEvent(e)) return;
      e.preventDefault();
      closeModal();
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [currentModal, closeModal]);

  if (!currentModal) return null;

  const ModalElement = MODAL_MAPPING[currentModal];

  return (
    <dialog id={currentModal} className="modal" open>
      <FocusSection
        focusKey="MODAL"
        autoFocus
        isFocusBoundary
        aria-label="Modal"
        className="modal-box relative max-w-4xl rounded-2xl bg-base-200 p-0 shadow-none ring-1 ring-base-content/10"
      >
        <FocusButton
          type="button"
          onClick={closeModal}
          aria-label="Fechar modal"
          className="btn btn-sm btn-circle btn-ghost absolute top-3 right-3 z-10"
        >
          <X className="size-4" aria-hidden="true" />
        </FocusButton>

        <ModalElement {...currentProps} />
      </FocusSection>

      <form method="dialog" className="modal-backdrop bg-base-200/80!">
        <button type="button" onClick={closeModal} aria-label="Fechar modal">
          close
        </button>
      </form>
    </dialog>
  );
};

export default ModalProvider;
