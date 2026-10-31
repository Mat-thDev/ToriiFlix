import { FocusButton } from "../../ui/FocusButton";

/**
 * Barra de abas da rota Detalhe (estilo Stremio) — a aba ativa ganha
 * sublinhado na cor primária. Cada aba é um FocusButton (remote/setas).
 */
const TabBar = ({ tabs, active, onChange }: UI.DetailTabBarProps) => (
  <div role="tablist" aria-label="Seções do detalhe" className="flex gap-6 border-b border-base-content/10">
    {tabs.map((tab) => (
      <FocusButton
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={active === tab.id}
        onClick={() => onChange(tab.id)}
        className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors ${
          active === tab.id
            ? "border-primary text-primary"
            : "border-transparent text-base-content/60 hover:text-base-content"
        }`}
      >
        {tab.label}
      </FocusButton>
    ))}
  </div>
);

export default TabBar;
