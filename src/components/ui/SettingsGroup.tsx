/** Cartão de configurações — agrupa linhas com divisores. */
export const SettingsGroup = ({ title, children }: UI.SettingsGroupProps) => (
  <section>
    {title && (
      <h3 className="mb-2 text-xs font-bold tracking-widest text-base-content/50 uppercase">
        {title}
      </h3>
    )}
    <div className="divide-y divide-base-content/5 rounded-box border border-base-content/10 bg-base-200/60 px-5">
      {children}
    </div>
  </section>
);
