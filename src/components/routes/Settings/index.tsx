import { useState } from "react";
import clsx from "clsx";
import { Palette, Puzzle, Settings2 } from "lucide-react";
import { FocusButton } from "../../ui/FocusButton";
import GeneralTab from "./tabs/GeneralTab";
import AppearanceTab from "./tabs/AppearanceTab";
import AddonsTab from "./tabs/AddonsTab";

/**
 * Registro de abas — para criar uma nova aba: arquivo em ./tabs + entrada aqui.
 * A ordem do array define a ordem exibida.
 */
const TABS: UI.SettingsTab[] = [
  { id: "general", label: "Geral", Icon: Settings2, component: GeneralTab },
  { id: "appearance", label: "Personalização", Icon: Palette, component: AppearanceTab },
  { id: "addons", label: "Addons", Icon: Puzzle, component: AddonsTab },
];

const SettingsRoute = () => {
  const [activeId, setActiveId] = useState(TABS[0].id);
  const active = TABS.find((tab) => tab.id === activeId) ?? TABS[0];
  const TabContent = active.component;

  return (
    <section aria-label="Configurações" className="mx-auto max-w-4xl">
      <h1>Configurações</h1>

      <div role="tablist" aria-label="Categorias de configuração" className="mt-5 flex gap-1 border-b border-base-content/10 pb-2">
        {TABS.map(({ id, label, Icon }) => {
          const selected = id === active.id;
          return (
            <FocusButton
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`settings-tab-${id}`}
              onClick={() => setActiveId(id)}
              className={clsx(
                "flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors",
                selected
                  ? "border-b-2 border-primary text-base-content"
                  : "border-b-2 border-transparent text-base-content/50 hover:text-base-content",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </FocusButton>
          );
        })}
      </div>

      <div role="tabpanel" id={`settings-tab-${active.id}`} className="mt-6 space-y-6">
        <TabContent />
      </div>
    </section>
  );
};

export default SettingsRoute;
