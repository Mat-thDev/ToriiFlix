import clsx from "clsx";
import { useAtomValue } from "jotai";
import { Minus, Square, X } from "lucide-react";
import { isDesktopAtom, isTauriRuntime } from "../../platform";
import useAppearance from "../../hooks/useAppearance";

/**
 * Controles de janela nativos — a janela roda com `decorations: false`
 * (tauri.conf.json), então o cromo é responsabilidade do app.
 * Só existe fora do webOS; fora do runtime Tauri os handlers são no-op.
 */
const runWindowAction = async (action: UI.WindowAction): Promise<void> => {
  if (!isTauriRuntime()) return;

  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  const appWindow = getCurrentWindow();

  if (action === "minimize") await appWindow.minimize();
  else if (action === "toggleMaximize") await appWindow.toggleMaximize();
  else await appWindow.close();
};

const BUTTON_CLASS =
  "flex h-8 w-10 items-center justify-center rounded-md text-base-content/70 transition-colors";

const WindowControls = () => {
  const isDesktop = useAtomValue(isDesktopAtom);
  const { windowControls } = useAppearance();

  // Setting "Mostrar controles de janela" (Personalização) + só no desktop
  if (!isDesktop || !windowControls) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Minimizar"
        title="Minimizar"
        onClick={() => void runWindowAction("minimize")}
        className={clsx(BUTTON_CLASS, "hover:bg-neutral hover:text-base-content")}
      >
        <Minus width={16} height={16} />
      </button>
      <button
        type="button"
        aria-label="Maximizar"
        title="Maximizar"
        onClick={() => void runWindowAction("toggleMaximize")}
        className={clsx(BUTTON_CLASS, "hover:bg-neutral hover:text-base-content")}
      >
        <Square width={16} height={16} />
      </button>
      <button
        type="button"
        aria-label="Fechar"
        title="Fechar"
        onClick={() => void runWindowAction("close")}
        className={clsx(BUTTON_CLASS, "hover:bg-error hover:text-error-content")}
      >
        <X width={16} height={16} />
      </button>
    </div>
  );
};

export default WindowControls;
