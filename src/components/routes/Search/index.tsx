import { useCallback, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { ArrowRight, History, Search } from "lucide-react";
import { searchQueryAtom } from "../../../atoms/search";
import useCatalog from "../../../hooks/useCatalog";
import useNavigation from "../../../hooks/useNavigation";
import useSearch from "../../../hooks/useSearch";
import useSearchHistory from "../../../hooks/useSearchHistory";
import MediaCard from "../../ui/MediaCard";
import { ErrorAlert } from "../../ui/ErrorAlert";
import { FocusButton } from "../../ui/FocusButton";
import { Input } from "../../ui/Input";
import { PosterSkeleton } from "../../skeletons/PosterSkeleton";
import Keyboard from "../../ui/Keyboard";

/** Fase de captura: roda antes do useInputNavigation global (window bubble). */
const CAPTURE = true;

const RESULT_SKELETON_COUNT = 8;

/**
 * Busca estilo smart TV (referencia webOS): campo no topo, teclado na
 * tela + historico a esquerda, dica/resultados a direita, fundo full-bleed.
 * Digitação física em fase de captura para não conflitar com o
 * Backspace/voltar do handler global.
 */
const SearchRoute = () => {
  const [query, setQuery] = useAtom(searchQueryAtom);
  const { items, loading, error, retry } = useSearch(query);
  const { terms, add } = useSearchHistory();
  const { navigate } = useNavigation();
  const routeRef = useRef<HTMLElement>(null);

  // Fundo: primeiro resultado com imagem; fallback estático da Home
  const { page: fallbackPage } = useCatalog("movie", { list: "featured", limit: 10 });
  const background =
    items.find((item) => item.background)?.background ??
    fallbackPage?.items.find((item) => item.background)?.background ??
    null;

  const pushChar = useCallback((value: string) => {
    setQuery((prev) => prev + value);
  }, [setQuery]);

  const backspace = useCallback(() => {
    setQuery((prev) => prev.slice(0, -1));
  }, [setQuery]);

  const openDetail = (item: Media.Item) => {
    add(query);
    navigate("Detail", { id: item.id, type: item.type });
  };

  // Teclado físico: imprimíveis + Backspace; setas/Enter/Esc ficam com o global
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;

      // Só digita com o foco dentro da rota: overlay (ex.: troca de perfis)
      // rouba o foco e o evento não pode vazar para a busca em segundo plano
      if (!(e.target instanceof Node) || !routeRef.current?.contains(e.target)) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
        return;
      }

      // Space com foco num botão deixa o clique nativo acontecer
      const onButton = e.target instanceof HTMLElement && e.target.closest("button");
      if (e.key === " " && onButton) return;

      if (e.key.length === 1) {
        e.preventDefault();
        pushChar(e.key);
      }
    };

    window.addEventListener("keydown", onKeyDown, CAPTURE);
    return () => window.removeEventListener("keydown", onKeyDown, CAPTURE);
  }, [pushChar, backspace]);

  const showResults = query.trim().length >= 2;

  return (
    <section ref={routeRef} aria-label="Pesquisa" className="relative -mx-8 -mt-6 min-h-full overflow-hidden">
      {background ? (
        <img
          src={background}
          alt=""
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(120%_80%_at_30%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_60%)]"
        />
      )}

      {/* Scrims — legibilidade do teclado e do campo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-base-300)_0%,color-mix(in_oklab,var(--color-base-300)_82%,transparent)_42%,color-mix(in_oklab,var(--color-base-300)_45%,transparent)_70%,color-mix(in_oklab,var(--color-base-300)_70%,transparent)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-base-300)_0%,color-mix(in_oklab,var(--color-base-300)_25%,transparent)_18%,transparent_40%,color-mix(in_oklab,var(--color-base-300)_60%,transparent)_85%,var(--color-base-300)_100%)]"
      />

      <div className="relative flex min-h-full flex-col px-8 pt-6 pb-10">
        {/* Campo de busca — display (readOnly); digitacao vem do teclado */}
        <div className="flex items-center gap-4 border-b border-base-content/20 pb-4">
          <Search className="size-7 shrink-0 text-base-content" aria-hidden="true" />
          <Input
            readOnly
            tabIndex={-1}
            aria-label="Termo de busca"
            value={query}
            placeholder="Digite um termo para buscar"
            className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-tight text-base-content placeholder:text-base-content/40"
          />
        </div>

        <div className="mt-8 flex flex-1 gap-10">
          {/* Esquerda: teclado + historico */}
          <div className="w-max shrink-0">
            <Keyboard onChar={pushChar} onBackspace={backspace} />

            <div className="torii-scroll-y mt-8 max-h-56 overflow-y-auto pr-2">
              <h2 className="flex items-center gap-2 text-sm font-bold text-base-content">
                <History className="size-4 text-base-content/60" aria-hidden="true" />
                Histórico de busca:
              </h2>
              {terms.length === 0 ? (
                <p className="mt-2 text-sm text-base-content/50">Nenhuma busca recente.</p>
              ) : (
                <ul className="mt-2 space-y-0.5">
                  {terms.map((term) => (
                    <li key={term}>
                      <FocusButton
                        type="button"
                        className="group flex items-center gap-2 rounded-md px-2 py-1 text-left text-sm text-base-content/70 transition-colors hover:bg-base-content/10 hover:text-base-content"
                        onClick={() => setQuery(term)}
                      >
                        <ArrowRight
                          className="size-3.5 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                          aria-hidden="true"
                        />
                        {term}
                      </FocusButton>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Direita: dica ou resultados */}
          <div className="min-w-0 flex-1">
            {showResults ? (
              <div aria-live="polite">
                {error ? (
                  <ErrorAlert message={`Não foi possível buscar: ${error}`} onRetry={retry} />
                ) : loading ? (
                  <div aria-busy="true" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                    {Array.from({ length: RESULT_SKELETON_COUNT }, (_, i) => (
                      <PosterSkeleton key={i} />
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <p className="text-base-content/60">Nenhum resultado para “{query.trim()}”.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                    {items.map((item) => (
                      <MediaCard key={`${item.type}-${item.id}`} item={item} onSelect={openDetail} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-end justify-center text-right">
                <p className="max-w-md text-2xl leading-snug font-bold text-base-content">
                  Use o teclado na tela e{" "}
                  <span className="text-primary">comece a digitar.</span>
                </p>
                <p className="mt-2 text-sm text-base-content/60">
                  {query.trim().length > 0
                    ? "Continue digitando para ver resultados…"
                    : "Ou use seu histórico de busca."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchRoute;
