/** Linha de configuração — texto à esquerda, controle à direita.
 * Realça quando o controle dela está em foco (remote/setas). */
export const SettingsRow = ({ title, description, control }: UI.SettingsRowProps) => (
  <div className="w-full flex items-center justify-between gap-6 rounded-lg px-2 py-3 transition-colors has-[[data-focused]]:bg-base-content/5">
    <div className="min-w-0">
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="mt-0.5 text-xs text-base-content/60">{description}</p>}
    </div>
    {control}
  </div>
);
