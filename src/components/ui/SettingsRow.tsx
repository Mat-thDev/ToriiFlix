/** Linha de configuração — texto à esquerda, controle à direita. */
export const SettingsRow = ({ title, description, control }: UI.SettingsRowProps) => (
  <div className="w-full flex items-center justify-between gap-6 py-3">
    <div className="min-w-0">
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="mt-0.5 text-xs text-base-content/60">{description}</p>}
    </div>
    {control}
  </div>
);
