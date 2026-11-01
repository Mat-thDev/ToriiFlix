import useSettings from "../../../../hooks/useSettings";
import { SettingsGroup } from "../../../ui/SettingsGroup";
import { SettingsRow } from "../../../ui/SettingsRow";
import { SegmentedControl } from "../../../ui/SegmentedControl";
import { Toggle } from "../../../ui/Toggle";
import { FocusButton } from "../../../ui/FocusButton";
import { Input } from "../../../ui/Input";

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

const GeneralTab = () => {
  const { settings, changeSetting } = useSettings();
  const { playback, system } = settings;

  return (
    <>
      <SettingsGroup title="Reprodução">
        <SettingsRow
          title="Reprodução automática"
          description="Inicia a reprodução automaticamente ao carregar os dados."
          control={
            <Toggle
              label="Reprodução Automática"
              checked={playback.autoPlay}
              onChange={(on) => changeSetting("playback", { autoPlay: on })}
            />
          }
        />
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
          title="Próximo episódio automático"
          description="Assim que um episódio acabar, inicia o próximo automaticamente."
          control={
            <Toggle
              label="Próximo Episódio Automático"
              checked={playback.autoNextEpisode}
              onChange={(on) => changeSetting("playback", { autoNextEpisode: on })}
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
          title="Volume Preferencial"
          description="Inicia a reprodução com o volume desejado."
          control={
            <div className="flex w-full max-w-18 items-center gap-2">
              <Input
                aria-label="Volume"
                value={settings.playback.volume}
                placeholder="100"
                max={100}
                min={0}
                type="number"
                disabled={false}
                onChange={(e) => {
                  let vol = parseInt(e.currentTarget.value);
                  let volSafe = Math.min(Math.max(vol, 0), 100);
                  changeSetting("playback", { volume: volSafe });
                }}
                className="rounded-lg border border-base-content/15 bg-base-content/5 px-3 py-2 text-sm placeholder:text-base-content/40"
              />
            </div>
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
        <SettingsRow
          title="Salvar histórico"
          description="Salva histórico de onde e quando você parou."
          control={
            <Toggle
              label="Salvar Histórico"
              checked={playback.saveHistory}
              onChange={(on) => changeSetting("playback", { saveHistory: on })}
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
