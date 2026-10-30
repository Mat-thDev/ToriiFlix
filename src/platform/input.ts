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

/** Alvo que realmente recebe digitação (ignora readOnly/disabled, ex.: displays). */
export const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLInputElement) return !target.readOnly && !target.disabled;
  if (target instanceof HTMLTextAreaElement) return !target.readOnly && !target.disabled;
  if (target instanceof HTMLSelectElement) return !target.disabled;
  return target.isContentEditable;
};

/** Sai do campo de texto: Esc ou tecla 461 do remote webOS. */
export const isExitTypingEvent = (e: KeyboardEvent): boolean =>
  e.key === "Escape" || e.keyCode === WEBOS_KEY_BACK;

/** Evento de "voltar" do remote webOS, Escape ou Backspace (fora de editáveis). */
export const isBackEvent = (e: KeyboardEvent): boolean => {
  const isBack = e.key === "Escape" || e.key === "Backspace" || e.keyCode === WEBOS_KEY_BACK;

  // Editável segura o Backspace (apagar texto)
  return isBack && !isEditableTarget(e.target);
};
