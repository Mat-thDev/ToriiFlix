const WEBOS_KEY_BACK = 461;

export const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
};

/** Evento de "voltar" do remote webOS, Escape ou Backspace (fora de editáveis). */
export const isBackEvent = (e: KeyboardEvent): boolean => {
  const isBack = e.key === "Escape" || e.key === "Backspace" || e.keyCode === WEBOS_KEY_BACK;

  // Editável segura o Backspace (apagar texto)
  return isBack && !isEditableTarget(e.target);
};
