import { useEffect, useRef } from "react";
import type { ComponentType } from "react";
import { X } from "lucide-react";
import useModals from "../../hooks/useModals";
import { isBackEvent } from "../../platform/input";
import { FocusButton } from "../ui/FocusButton";
import { FocusSection } from "../ui/FocusSection";
import StreamListModal from "./StreamListModal";
import AddonInstallModal from "./AddonInstallModal";
import useNavigation from "../../hooks/useNavigation";

const MODAL_MAPPING: Record<Modals.ModalsKeys, ComponentType<any>> = {
  StreamSelector: StreamListModal,
  AddonInstall: AddonInstallModal,
};

const ModalProvider = () => {
  const { currentModal, currentProps, closeModal } = useModals();
  const { currentPage } = useNavigation()
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!currentModal) return;
    closeModal();
  }, [currentPage])

  // showModal(): focus-trap nativa + `inert` no fundo (restauração de foco automática ao fechar)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!currentModal || !dialog) return;

    if (!dialog.open) dialog.showModal();
    return () => dialog.close();
  }, [currentModal]);


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
    <dialog
      ref={dialogRef}
      id={currentModal}
      className="modal"
      onCancel={(e) => {
        e.preventDefault(); // Esc: fecha via estado React (não dessincroniza)
        closeModal();
      }}
    >
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
