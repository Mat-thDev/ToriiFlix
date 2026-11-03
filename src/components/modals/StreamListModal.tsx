import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronRight, Clapperboard, Magnet, RadioTower } from "lucide-react";
import { toast } from "react-toastify";
import useStreams from "../../hooks/useStreams";
import { formatRuntime } from "../../utils/format";
import { FocusButton } from "../ui/FocusButton";
import { ErrorAlert } from "../ui/ErrorAlert";
import { Toggle } from "../ui/Toggle";
import useNavigation from "../../hooks/useNavigation";

const KIND_LABEL: Record<Media.Kind, string> = {
  movie: "Filme",
  series: "Série",
  tv: "Canal",
  channel: "Canal",
  subtitles: "Legenda",
};

/** Qualidade embutida no titulo do addon (ex.: "Torrentio 1080p ..."). */
const QUALITY_RE = /\b(4k|2160p|1080p|720p|480p)\b/i;
const qualityOf = (title?: string) => title?.match(QUALITY_RE)?.[0]?.toUpperCase();


const StreamListModal = ({ type, id, item, details, episode }: Modals.PropsMap["StreamSelector"]) => {
  const invalid = !type || !id || (type === "series" && !episode);
  const { streams, loading, error, retry } = useStreams(type, id, episode);
  const { navigate } = useNavigation()

  const [provider, setProvider] = useState("all");
  const [torrentOnly, setTorrentOnly] = useState(false);

  useEffect(() => {
    if (invalid) toast.error("Não foi possível adquirir uma fonte de stream confiável.");
  }, [invalid]);

  // Contagem por addon (ordenada) — escala bem com muitos addons
  const providers = useMemo(() => {
    const counts = new Map<string, number>();
    for (const stream of streams) {
      counts.set(stream.provider, (counts.get(stream.provider) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [streams]);

  const visible = streams.filter(
    (stream) => (provider === "all" || stream.provider === provider) && (!torrentOnly || stream.torrentOnly),
  );

  useEffect(() => setProvider("all"), [streams]);

  if (invalid) return null;

  const meta = [
    item?.year,
    item?.rating && `★ ${item.rating}`,
    KIND_LABEL[type],
    formatRuntime(details?.runtime),
    episode && `T${episode.season} · E${episode.number}${episode.name ? ` · ${episode.name}` : ""}`,
  ].filter(Boolean);


  const selectStream = (stream: Media.Stream) => {
    if (!stream || !item) return null;

    const data: Player.StreamConfig = {
      id: item.id,
      stream,
      episode,
      media: {
        item: item,
        details: details ? details : undefined
      }
    }

    navigate("Watch", data)
  }

  return (
    <div className="grid gap-6 p-6 md:grid-cols-[300px_1fr]">
      {/* info + filtros */}
      <div className="flex min-w-0 flex-col gap-5">
        <div className="relative overflow-hidden rounded-xl ring-1 ring-base-content/10">
          <img
            src={item?.background ?? item?.poster}
            alt=""
            loading="lazy"
            className="aspect-video w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />
          <span className="absolute top-2.5 left-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold tracking-widest text-white/90 uppercase backdrop-blur-sm">
            {KIND_LABEL[type]}
          </span>
          {item?.poster && (
            <img
              src={item.poster}
              alt=""
              loading="lazy"
              className="absolute bottom-3 left-3 h-16 w-11 rounded-md object-cover ring-1 ring-white/20"
            />
          )}
        </div>

        <div>
          <h2 className="truncate" title={item?.name}>{item?.name ?? "Título"}</h2>
          {meta.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {meta.map((entry) => (
                <span
                  key={String(entry)}
                  className="rounded-full border border-base-content/10 bg-base-content/5 px-2 py-0.5 text-[11px] font-semibold text-base-content/60"
                >
                  {entry}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* filtros */}
        <div className="space-y-3 rounded-xl border border-base-content/10 bg-base-content/5 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold tracking-widest text-base-content/50 uppercase">
              Addon
            </p>
            <span className="text-[10px] font-semibold text-base-content/40">
              {streams.length} {streams.length === 1 ? "fonte" : "fontes"}
            </span>
          </div>

          {providers.length > 1 && (
            // wrap + scroll: muitos addons nao estouram o card
            <div
              role="radiogroup"
              aria-label="Filtrar por addon"
              className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto pr-1"
            >
              {[{ name: "all", label: "Todos", count: streams.length }, ...providers.map((p) => ({ name: p.name, label: p.name, count: p.count }))].map(
                (option) => {
                  const active = provider === option.name;
                  return (
                    <FocusButton
                      key={option.name}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setProvider(option.name)}
                      className={clsx(
                        "flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-content"
                          : "border-base-content/10 bg-base-content/5 text-base-content/60 hover:text-base-content",
                      )}
                    >
                      <span className="truncate">
                        {option.name === "all" ? "Todos" : option.label}
                      </span>
                      <span
                        className={clsx(
                          "rounded-full px-1 text-[10px] font-bold tabular-nums",
                          active ? "bg-primary-content/25" : "bg-base-content/10",
                        )}
                      >
                        {option.count}
                      </span>
                    </FocusButton>
                  );
                },
              )}
            </div>
          )}

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-base-content/10 bg-base-content/5 px-3 py-2">
            <span className="text-sm text-base-content/70">Somente torrents</span>
            <Toggle label="Somente torrents" checked={torrentOnly} onChange={setTorrentOnly} />
          </label>
        </div>
      </div>

      {/* lista de fontes — altura fixa + scroll interno */}
      <div className="flex h-100 min-w-0 flex-col">
        <div className="mb-3 flex shrink-0 items-center justify-between gap-4 pr-9">
          <p className="text-xs font-bold tracking-widest text-base-content/50 uppercase">
            Fontes disponíveis
          </p>
          {!loading && !error && streams.length > 0 && (
            <span className="rounded-full bg-base-content/5 px-2 py-0.5 text-[11px] font-bold tabular-nums text-base-content/50">
              {visible.length} de {streams.length}
            </span>
          )}
        </div>

        {error && (
          <div className="shrink-0">
            <ErrorAlert message={`Não foi possível carregar as fontes: ${error}`} onRetry={retry} />
          </div>
        )}

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
          <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain rounded-xl bg-base-content/[0.02] p-2">
            {visible.map((stream, index) => {
              const quality = qualityOf(stream.title);

              return (
                <li key={`${stream.provider}-${index}`}>
                  <FocusButton
                    type="button"
                    title="Reproduzir"
                    onClick={() => selectStream(stream)}
                    aria-label={`Reproduzir via ${stream.provider}`}
                    className="group flex w-full items-center gap-4 rounded-xl bg-base-200/60 p-3 text-left ring-1 ring-base-content/5 transition-colors hover:bg-base-200 data-focused:ring-2 data-focused:ring-primary"
                  >
                    <span
                      className={clsx(
                        "flex size-11 shrink-0 items-center justify-center rounded-lg",
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

                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="max-w-32 truncate rounded bg-base-content/10 px-1.5 py-0.5 text-[10px] font-bold text-base-content/60">
                          {stream.provider}
                        </span>
                        {quality && (
                          <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                            {quality}
                          </span>
                        )}
                        {stream.torrentOnly && (
                          <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning">
                            Torrent · em breve
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      className="size-4 shrink-0 text-base-content/25 transition-colors group-data-focused:text-primary"
                      aria-hidden="true"
                    />
                  </FocusButton>
                </li>
              );
            })}

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
