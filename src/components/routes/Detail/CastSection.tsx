import { User } from "lucide-react";

/**
 * Seção de elenco principal — linha horizontal estática (retrato + nome +
 * personagem). Sem ação: o foco do remote passa por cima sem parar aqui.
 */
const CastSection = ({ cast }: UI.CastSectionProps) => {
  if (cast.length === 0) return null;

  return (
    <section aria-label="Elenco">
      <h2 className="mb-4">Elenco principal</h2>

      <ul className="flex gap-4 overflow-x-auto pb-2">
        {cast.map((member) => (
          <li key={member.name} className="w-36 shrink-0">
            {member.profile ? (
              <img
                src={member.profile}
                alt=""
                loading="lazy"
                className="aspect-2/3 w-full rounded-xl bg-base-200 object-cover ring-1 ring-base-content/10"
              />
            ) : (
              <div className="flex aspect-2/3 w-full items-center justify-center rounded-xl bg-base-200 ring-1 ring-base-content/10">
                <User className="size-8 text-base-content/20" aria-hidden="true" />
              </div>
            )}
            <p className="mt-2 truncate text-sm font-semibold">{member.name}</p>
            {member.character && (
              <p className="truncate text-xs text-base-content/60">{member.character}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default CastSection;
