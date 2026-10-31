/**
 * Seção "Sobre" — sinopse completa, direção/criação, título original,
 * títulos alternativos e onde assistir (provedores da região). Estática.
 */
const InfoSection = ({ details }: UI.InfoSectionProps) => (
  <section aria-label="Sobre">
    <h2 className="mb-4">Sobre</h2>

    {details.description && (
      <p className="max-w-3xl text-sm leading-relaxed text-base-content/70 md:text-base">
        {details.description}
      </p>
    )}

    <dl className="mt-5 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-4 text-sm md:grid-cols-3">
      {details.director && (
        <div>
          <dt className="text-xs font-semibold tracking-wide text-base-content/45 uppercase">
            {details.type === "series" ? "Criação" : "Direção"}
          </dt>
          <dd className="mt-1">{details.director}</dd>
        </div>
      )}

      {details.originalTitle && details.originalTitle !== details.name && (
        <div>
          <dt className="text-xs font-semibold tracking-wide text-base-content/45 uppercase">
            Título original
          </dt>
          <dd className="mt-1">{details.originalTitle}</dd>
        </div>
      )}

      {details.episodeCount !== undefined && (
        <div>
          <dt className="text-xs font-semibold tracking-wide text-base-content/45 uppercase">
            Episódios
          </dt>
          <dd className="mt-1">{details.episodeCount}</dd>
        </div>
      )}

      {details.runtime !== undefined && details.type === "series" && (
        <div>
          <dt className="text-xs font-semibold tracking-wide text-base-content/45 uppercase">
            Duração / episódio
          </dt>
          <dd className="mt-1">{details.runtime} min</dd>
        </div>
      )}
    </dl>

    {details.alternativeTitles.length > 0 && (
      <div className="mt-5 max-w-3xl">
        <h3 className="text-xs font-semibold tracking-wide text-base-content/45 uppercase">
          Títulos alternativos
        </h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {details.alternativeTitles.map((alt, i) => (
            <li
              key={`${alt.region ?? ""}-${alt.title}-${i}`}
              className="badge badge-ghost badge-sm font-medium text-base-content/70"
            >
              {alt.region && <span className="mr-1 opacity-50">{alt.region}</span>}
              {alt.title}
            </li>
          ))}
        </ul>
      </div>
    )}

    {details.providers.length > 0 && (
      <div className="mt-5 max-w-3xl">
        <h3 className="text-xs font-semibold tracking-wide text-base-content/45 uppercase">
          Onde assistir
        </h3>
        <ul className="mt-2 flex flex-wrap gap-3">
          {details.providers.map((provider) => (
            <li
              key={provider.name}
              className="flex items-center gap-2 rounded-btn bg-base-200 px-3 py-2 text-sm ring-1 ring-base-content/10"
            >
              {provider.logo && (
                <img src={provider.logo} alt="" loading="lazy" className="size-6 rounded" />
              )}
              {provider.name}
            </li>
          ))}
        </ul>
      </div>
    )}
  </section>
);

export default InfoSection;
