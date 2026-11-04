import useSettings from "../../../../hooks/useSettings";
import { SUBTITLE_BACKGROUND, SUBTITLE_FONT, SUBTITLE_SIZE } from "../../../../utils/subtitle";
import { SettingsGroup } from "../../../ui/SettingsGroup";
import { SettingsRow } from "../../../ui/SettingsRow";
import { SegmentedControl } from "../../../ui/SegmentedControl";
import { Toggle } from "../../../ui/Toggle";
import { FocusButton } from "../../../ui/FocusButton";
import { Minus, Plus } from "lucide-react";

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

const SUBTITLE_SIZE_OPTIONS: UI.SegmentedOption<AppSettings.SubtitleSize>[] = [
  { value: "small", label: "Pequeno" },
  { value: "medium", label: "Médio" },
  { value: "large", label: "Grande" },
];

const SUBTITLE_FONT_OPTIONS: UI.SegmentedOption<AppSettings.SubtitleFont>[] = [
  { value: "default", label: "Padrão" },
  { value: "sans", label: "Sans" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
];

const SUBTITLE_BACKGROUND_OPTIONS: UI.SegmentedOption<AppSettings.SubtitleBackground>[] = [
  { value: "dark", label: "Escuro" },
  { value: "black", label: "Preto" },
  { value: "transparent", label: "Nenhum" },
];

const VOLUME_STEP = 5;

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
            <div className="flex items-center gap-3">
              <FocusButton
                type="button"
                aria-label="Diminuir volume"
                className="btn btn-sm btn-circle btn-outline"
                onClick={() =>
                  changeSetting("playback", {
                    volume: Math.max(0, playback.volume - VOLUME_STEP),
                  })
                }
              >
                <Minus className="size-4" aria-hidden="true" />
              </FocusButton>
              <span
                aria-live="polite"
                className="w-12 text-center text-sm font-semibold tabular-nums"
              >
                {playback.volume}%
              </span>
              <FocusButton
                type="button"
                aria-label="Aumentar volume"
                className="btn btn-sm btn-circle btn-outline"
                onClick={() =>
                  changeSetting("playback", {
                    volume: Math.min(100, playback.volume + VOLUME_STEP),
                  })
                }
              >
                <Plus className="size-4" aria-hidden="true" />
              </FocusButton>
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

      <SettingsGroup title="Legendas">
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
          title="Tamanho do texto"
          description="Tamanho das legendas na tela"
          control={
            <SegmentedControl
              aria-label="Tamanho da legenda"
              value={playback.subtitleSize}
              options={SUBTITLE_SIZE_OPTIONS}
              onChange={(subtitleSize) => changeSetting("playback", { subtitleSize })}
            />
          }
        />
        <SettingsRow
          title="Fonte"
          description="Família tipográfica das legendas"
          control={
            <SegmentedControl
              aria-label="Fonte da legenda"
              value={playback.subtitleFont}
              options={SUBTITLE_FONT_OPTIONS}
              onChange={(subtitleFont) => changeSetting("playback", { subtitleFont })}
            />
          }
        />
        <SettingsRow
          title="Cor de fundo"
          description="Fundo atrás do texto da legenda"
          control={
            <SegmentedControl
              aria-label="Cor de fundo da legenda"
              value={playback.subtitleBackground}
              options={SUBTITLE_BACKGROUND_OPTIONS}
              onChange={(subtitleBackground) => changeSetting("playback", { subtitleBackground })}
            />
          }
        />
      </SettingsGroup>

      {/* Prévia ao vivo — espelha o SubtitleOverlay do player usando os
          mesmos maps (src/utils/subtitle.ts), então o que se vê aqui é o
          que sai na tela */}
      <section>
        <h3 className="mb-2 text-xs font-bold tracking-widest text-base-content/50 uppercase">
          Prévia
        </h3>
        <div className="flex items-center justify-center rounded-box border border-base-content/10 bg-base-200/60 px-4 py-6">
          <span
            className="inline-block max-w-full px-1.5 py-0.5 font-medium leading-snug"
            style={{
              color: "#ffffff",
              fontFamily: SUBTITLE_FONT[playback.subtitleFont],
              fontSize: SUBTITLE_SIZE[playback.subtitleSize],
              backgroundColor: SUBTITLE_BACKGROUND[playback.subtitleBackground],
              borderRadius: "var(--radius-field, 4px)",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
            }}
          >
            Este é um exemplo de legenda
          </span>
        </div>
      </section>

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
