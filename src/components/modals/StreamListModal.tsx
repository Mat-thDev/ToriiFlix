import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Clapperboard, Magnet, RadioTower } from "lucide-react";
import { toast } from "react-toastify";
import useStreams from "../../hooks/useStreams";
import { formatRuntime } from "../../utils/format";
import { FocusButton } from "../ui/FocusButton";
import { ErrorAlert } from "../ui/ErrorAlert";
import { SegmentedControl } from "../ui/SegmentedControl";
import { Toggle } from "../ui/Toggle";

type StreamSelectorProps = Modals.PropsMap["StreamSelector"];


const StreamListModal = ({ type, id, item, details }: StreamSelectorProps) => {
  const invalid = !type || !id;
  const { streams, loading, error, retry } = useStreams(type, id);

  const [provider, setProvider] = useState("all");
  const [torrentOnly, setTorrentOnly] = useState(false);

  // Toast fora do render
  useEffect(() => {
    if (invalid) toast.error("Não foi possível adquirir uma fonte de stream confiável.");
  }, [invalid]);

  // Filtros derivados da lista 
  const providers = useMemo(() => {
    const names = [...new Set(streams.map((stream) => stream.provider))];
    return names.map((name) => ({ value: name, label: name }));
  }, [streams]);

  const visible = streams.filter(
    (stream) => (provider === "all" || stream.provider === provider) && (!torrentOnly || stream.torrentOnly),
  );

  useEffect(() => setProvider("all"), [streams]);

  if (invalid) return null;

  const meta = [
    item?.year,
    item?.rating && `★ ${item.rating}`,
    type === "series" ? "Série" : "Filme",
    formatRuntime(details?.runtime),
  ].filter(Boolean);


  console.log(streams);

  return (
    <div className="grid gap-8 p-6 md:grid-cols-[300px_1fr]">
      {/* Esquerda — metadata + filtros */}
      <div>
        <div className="overflow-hidden rounded-xl ring-1 ring-base-content/10">
          <img
            src={item?.background ?? item?.poster}
            alt=""
            loading="lazy"
            className="aspect-video w-full object-cover"
          />
        </div>

        <p className="mt-4 text-xs font-bold tracking-widest text-primary uppercase">
          {type === "series" ? "Série" : "Filme"}
        </p>
        <h2 className="mt-1">{item?.name ?? "Título"}</h2>
        {meta.length > 0 && (
          <p className="mt-1 text-sm text-base-content/60">{meta.join(" · ")}</p>
        )}

        <div className="mt-5 space-y-4">
          {providers.length > 1 && (
            <div>
              <p className="mb-2 text-xs font-bold tracking-widest text-base-content/50 uppercase">
                Addon
              </p>
              <SegmentedControl
                aria-label="Filtrar por addon"
                value={provider}
                options={[{ value: "all", label: "Todos" }, ...providers]}
                onChange={setProvider}
              />
            </div>
          )}

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-base-content/10 bg-base-content/5 px-3 py-2">
            <span className="text-sm text-base-content/70">Somente torrents</span>
            <Toggle label="Somente torrents" checked={torrentOnly} onChange={setTorrentOnly} />
          </label>
        </div>
      </div>

      {/* Direita — lista de streams dos addons */}
      <div className="min-w-0 h-100 overflow-hidden">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <p className="text-xs font-bold tracking-widest text-base-content/50 uppercase">
            Fontes disponíveis
          </p>
          {!loading && !error && streams.length > 0 && (
            <span className="text-xs text-base-content/40">{visible.length}</span>
          )}
        </div>

        {error && <ErrorAlert message={`Não foi possível carregar as fontes: ${error}`} onRetry={retry} />}

        {loading && (
          <div aria-busy="true" className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl bg-base-200/60 p-3">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-base-content/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-base-content/10" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-base-content/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && (
          <ol className="space-y-3 p-2">
            {visible.map((stream, index) => (
              <li key={`${stream.provider}-${index}`}>
                <FocusButton
                  type="button"
                  title="Player em breve"
                  aria-label={`Reproduzir via ${stream.provider}`}
                  className="flex w-full items-center gap-4 rounded-xl bg-base-200/60 p-3 text-left ring-1 ring-base-content/5 transition-shadow data-focused:ring-2 data-focused:ring-primary"
                >
                  <span
                    className={clsx(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      stream.torrentOnly
                        ? "bg-warning/15 text-warning"
                        : "bg-primary/15 text-primary",
                    )}
                  >
                    {stream.torrentOnly ? (
                      <Magnet className="size-5" aria-hidden="true" />
                    ) : (
                      <Clapperboard className="size-5" aria-hidden="true" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {stream.title ?? `Stream ${index + 1}`}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-base-content/50">
                      {stream.provider}
                      {stream.torrentOnly && " · Torrent (player em breve)"}
                    </p>
                  </div>
                </FocusButton>
              </li>
            ))}

            {visible.length === 0 && (
              <li className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-base-content/15 px-6 py-12 text-center">
                <RadioTower className="size-9 text-base-content/25" aria-hidden="true" />
                <p className="text-sm font-semibold">
                  {streams.length === 0
                    ? "Nenhuma fonte de stream disponível"
                    : "Nenhuma fonte com esses filtros"}
                </p>
                <p className="text-xs text-base-content/50">
                  {streams.length === 0
                    ? "Habilite um addon com streams nas configurações."
                    : "Ajuste os filtros ao lado para ver as fontes."}
                </p>
              </li>
            )}
          </ol>
        )}
      </div>
    </div>
  );
};

export default StreamListModal;
