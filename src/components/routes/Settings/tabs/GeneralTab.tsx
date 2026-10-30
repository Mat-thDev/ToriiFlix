import useSettings from "../../../../hooks/useSettings";
import { SettingsGroup } from "../../../ui/SettingsGroup";
import { SettingsRow } from "../../../ui/SettingsRow";
import { SegmentedControl } from "../../../ui/SegmentedControl";
import { Toggle } from "../../../ui/Toggle";
import { FocusButton } from "../../../ui/FocusButton";

const LANGUAGE_OPTIONS: UI.SegmentedOption[] = [
  { value: "pt-BR", label: "Português" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

const QUALITY_OPTIONS: UI.SegmentedOption<AppSettings.Quality>[] = [
  { value: "auto", label: "Automática" },
  { value: "1080p", label: "1080p" },
  { value: "720p", label: "720p" },
];

/** Aba Geral — preferências de reprodução, idioma e sistema. */
const GeneralTab = () => {
  const { settings, changeSetting } = useSettings();
  const { playback, system } = settings;

  return (
    <>
      <SettingsGroup title="Reprodução">
        <SettingsRow
          title="Legendas automáticas"
          description="Exibe legendas quando disponíveis"
          control={
            <Toggle
              label="Legendas automáticas"
              checked={playback.autoSubtitles}
              onChange={(on) => changeSetting("playback", { autoSubtitles: on })}
            />
          }
        />
        <SettingsRow
          title="Qualidade máxima"
          description="Limite de resolução dos streams"
          control={
            <SegmentedControl
              aria-label="Qualidade máxima"
              value={playback.maxQuality}
              options={QUALITY_OPTIONS}
              onChange={(maxQuality) => changeSetting("playback", { maxQuality })}
            />
          }
        />
        <SettingsRow
          title="Pular introduções"
          description="Avança automaticamente créditos de abertura"
          control={
            <Toggle
              label="Pular introduções"
              checked={playback.skipIntros}
              onChange={(on) => changeSetting("playback", { skipIntros: on })}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Sistema">
        <SettingsRow
          title="Idioma"
          description="Idioma da interface"
          control={
            <SegmentedControl
              aria-label="Idioma"
              value={system.language}
              options={LANGUAGE_OPTIONS}
              onChange={(language) => changeSetting("system", { language })}
            />
          }
        />
        <SettingsRow
          title="Iniciar com o sistema"
          description="Abre o app junto com o dispositivo"
          control={
            <Toggle
              label="Iniciar com o sistema"
              checked={system.startWithSystem}
              onChange={(on) => changeSetting("system", { startWithSystem: on })}
            />
          }
        />
        <SettingsRow
          title="Armazenamento"
          description="Cache e dados locais do app"
          control={
            <FocusButton type="button" className="btn btn-sm btn-outline">
              Limpar cache
            </FocusButton>
          }
        />
      </SettingsGroup>
    </>
  );
};

export default GeneralTab;
