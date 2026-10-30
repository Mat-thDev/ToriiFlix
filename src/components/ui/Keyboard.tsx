import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Delete } from "lucide-react";
import { FocusButton } from "./FocusButton";

const COLUMNS = 7;

const LETTER_ROWS: string[][] = [
  ["A", "B", "C", "Ç", "D", "E", "F"],
  ["G", "H", "I", "J", "K", "L", "M"],
  ["N", "O", "P", "Q", "R", "S", "T"],
  ["U", "V", "W", "X", "Y", "Z"],
];

const NUMBER_ROWS: string[][] = [
  ["1", "2", "3", "4", "5", "6", "7"],
  ["8", "9", "0", ".", ",", "-", ":"],
  ["'", "?", "!", "(", ")", "&", "+"],
];

const KEY_CLASS =
  "flex h-10 min-w-10 items-center justify-center rounded-lg border border-base-content/10 bg-base-content/5 text-sm font-semibold text-base-content/80 transition-colors hover:border-base-content/30 hover:text-base-content";

/**
 * Teclado na tela (10-foot) — grid de 7 colunas em ordem alfabetica,
 * como smart TVs. Camada `123` alterna numeros/simbolos; espaço e
 * apagar ficam fixos na linha inferior. Todos os keys sao <button>
 * para a navegacao espacial (remote/setas).
 */
const Keyboard = ({ onChar, onBackspace }: UI.KeyboardProps) => {
  const [numbers, setNumbers] = useState(false);
  const firstKeyRef = useRef<HTMLButtonElement>(null);

  // Foco inicial na primeira tecla (remote ja consegue navegar a partir dai)
  useEffect(() => {
    firstKeyRef.current?.focus({ preventScroll: true });
  }, []);

  const rows = numbers ? NUMBER_ROWS : LETTER_ROWS;

  return (
    <div role="group" aria-label="Teclado na tela" className="w-max select-none">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(2.5rem, 1fr))` }}
      >
        {rows.map((row, rowIndex) =>
          row.map((value, keyIndex) => (
            <FocusButton
              key={`${rowIndex}-${value}`}
              type="button"
              className={KEY_CLASS}
              buttonRef={rowIndex === 0 && keyIndex === 0 ? firstKeyRef : undefined}
              onClick={() => onChar(value)}
            >
              {value}
            </FocusButton>
          )),
        )}
      </div>

      <div className="mt-1.5 flex gap-1.5">
        <FocusButton
          type="button"
          className={clsx(KEY_CLASS, "flex-1 px-4 text-xs tracking-widest uppercase")}
          onClick={() => onChar(" ")}
        >
          Espaço
        </FocusButton>
        <FocusButton
          type="button"
          aria-label="Apagar"
          className={clsx(KEY_CLASS, "px-4")}
          onClick={onBackspace}
        >
          <Delete className="size-4" aria-hidden="true" />
        </FocusButton>
        <FocusButton
          type="button"
          aria-label={numbers ? "Voltar para letras" : "Números e símbolos"}
          aria-pressed={numbers}
          className={clsx(KEY_CLASS, "px-4")}
          onClick={() => setNumbers((n) => !n)}
        >
          {numbers ? "ABC" : "123"}
        </FocusButton>
      </div>
    </div>
  );
};

export default Keyboard;
