import useSettings from "../../../../hooks/useSettings";
import { SettingsGroup } from "../../../ui/SettingsGroup";
import { SettingsRow } from "../../../ui/SettingsRow";
import { SegmentedControl } from "../../../ui/SegmentedControl";
import { Toggle } from "../../../ui/Toggle";

const THEME_OPTIONS: UI.SegmentedOption<AppSettings.Theme>[] = [
  { value: "torii", label: "Padrão" },
  { value: "torii-cinema", label: "Cinema" },
  { value: "torii-ember", label: "Ember" },
  { value: "torii-ink", label: "Ink" },
  { value: "torii-noir", label: "Noir" },
];

const DENSITY_OPTIONS: UI.SegmentedOption<AppSettings.CardDensity>[] = [
  { value: "compact", label: "Compacta" },
  { value: "comfortable", label: "Confortável" },
];

const SIDEBAR_OPTIONS: UI.SegmentedOption<AppSettings.SidebarMode>[] = [
  { value: "always", label: "Sempre" },
  { value: "focus", label: "No foco" },
];

/** Aba Personalização — tema, densidade e layout. */
const AppearanceTab = () => {
  const { settings, changeSetting } = useSettings();
  const { appearance } = settings;

  return (
    <>
      <SettingsGroup title="Tema">
        <SettingsRow
          title="Tema visual"
          description="Paleta de cores da interface"
          control={
            <SegmentedControl
              aria-label="Tema visual"
              value={appearance.theme}
              options={THEME_OPTIONS}
              onChange={(theme) => changeSetting("appearance", { theme })}
            />
          }
        />
        <SettingsRow
          title="Animações"
          description="Transições e efeitos de foco"
          control={
            <Toggle
              label="Animações"
              checked={appearance.animations}
              onChange={(on) => changeSetting("appearance", { animations: on })}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Layout">
        <SettingsRow
          title="Densidade dos cards"
          description="Tamanho das capas no catálogo"
          control={
            <SegmentedControl
              aria-label="Densidade dos cards"
              value={appearance.cardDensity}
              options={DENSITY_OPTIONS}
              onChange={(cardDensity) => changeSetting("appearance", { cardDensity })}
            />
          }
        />
        <SettingsRow
          title="Barra lateral"
          description="Quando a navegação lateral aparece"
          control={
            <SegmentedControl
              aria-label="Barra lateral"
              value={appearance.sidebarMode}
              options={SIDEBAR_OPTIONS}
              onChange={(sidebarMode) => changeSetting("appearance", { sidebarMode })}
            />
          }
        />
        <SettingsRow
          title="Mostrar controles de janela"
          description="Minimizar/maximizar/fechar (desktop)"
          control={
            <Toggle
              label="Mostrar controles de janela"
              checked={appearance.windowControls}
              onChange={(on) => changeSetting("appearance", { windowControls: on })}
            />
          }
        />
      </SettingsGroup>
    </>
  );
};

export default AppearanceTab;
