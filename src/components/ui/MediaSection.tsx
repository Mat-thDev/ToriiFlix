import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { SwiperClass } from "swiper/react";
import "swiper/css";
import useCatalog from "../../hooks/useCatalog";
import MediaCard, { POSTER_WIDTH } from "./MediaCard";
import { ErrorAlert } from "./ErrorAlert";
import { FocusButton } from "./FocusButton";
import { PosterSkeleton } from "../skeletons/PosterSkeleton";

const SKELETON_COUNT = 8;

/** Carregamento progressivo: mostra uma janela inicial e revela mais conforme o foco chega no fim. */
const INITIAL_WINDOW = 12;
const WINDOW_STEP = 10;
const NEAR_END = 3;

/**
 * Traz o slide focado p/ dentro da viewport com deslocamento mínimo.
 * `scrollIntoView` não funciona aqui: o Swiper move tudo via transform.
 * Alinha pela esquerda só quando o card está cortado à direita (passo
 * de 1 em 1 nas setas do remote), senão alinha o card focado à esquerda.
 */
const revealSlide = (swiper: SwiperClass, slide: HTMLElement): void => {
  const slides = swiper.slides;
  const index = Array.from(slides).indexOf(slide);
  if (index < 0) return;

  const viewWidth = swiper.el.clientWidth;
  const viewLeft = -swiper.translate;
  const viewRight = viewLeft + viewWidth;
  const slideLeft = slide.offsetLeft;
  const slideRight = slideLeft + slide.offsetWidth;

  if (slideLeft >= viewLeft && slideRight <= viewRight) return;

  let target = index;

  if (slideRight > viewRight) {
    // menor índice que ainda deixa o slide focado inteiro à direita
    const needed = slideRight - viewWidth;
    for (let i = index - 1; i >= 0; i--) {
      if (slides[i].offsetLeft >= needed) target = i;
      else break;
    }
  }

  if (target !== swiper.activeIndex) swiper.slideTo(target);
};

/** Seção de conteúdo: título + carrossel (Swiper) do addon. Cada seção é autônoma (loading/erro/retry). */
const MediaSection = ({
  title,
  kind,
  list = "top",
  genre,
  limit = 30,
  sources,
  source,
  onSelect,
}: UI.MediaSectionProps) => {
  const { page, loading, error, retry } = useCatalog(kind, { list, genre, limit, sources });
  const items = page?.items ?? [];

  const swiperRef = useRef<SwiperClass | null>(null);
  const focusinRef = useRef<((event: Event) => void) | null>(null);
  const itemCountRef = useRef(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_WINDOW);

  itemCountRef.current = items.length;

  const revealMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + WINDOW_STEP, itemCountRef.current));
  }, []);

  const syncNav = (swiper: SwiperClass) => {
    setAtStart(swiper.isBeginning);
    setAtEnd(swiper.isEnd);

    // última janela alcançada: página local esgotou ou está perto do fim
    if (swiper.activeIndex >= swiper.slides.length - NEAR_END) revealMore();
  };

  const handleSwiper = (swiper: SwiperClass) => {
    const oldEl = swiperRef.current?.el;
    if (oldEl && focusinRef.current) {
      oldEl.removeEventListener("focusin", focusinRef.current);
    }
    swiperRef.current = swiper;
    syncNav(swiper);

    // remote/setas: foco fora da viewport revela o slide (ver revealSlide)
    // e perto do fim da janela carrega mais itens
    const onFocusIn = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const slide = target.closest<HTMLElement>(".swiper-slide");
      if (!slide) return;

      revealSlide(swiper, slide);

      const index = Array.from(swiper.slides).indexOf(slide);
      if (index >= swiper.slides.length - NEAR_END) revealMore();
    };
    focusinRef.current = onFocusIn;
    swiper.el.addEventListener("focusin", onFocusIn);
  };

  // Janela cresceu: recalcula layout e estado das setas
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    swiper.update();
    setAtStart(swiper.isBeginning);
    setAtEnd(swiper.isEnd);
  }, [visibleCount]);

  useEffect(
    () => () => {
      const el = swiperRef.current?.el;
      if (el && focusinRef.current) {
        el.removeEventListener("focusin", focusinRef.current);
      }
    },
    [],
  );

  if (!loading && !error && items.length === 0) return null;

  const fits = atStart && atEnd;
  const visibleItems = items.slice(0, visibleCount);

  return (
    <section aria-label={title} className="group/section">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2>{title}</h2>
          {source && (
            <span className="badge badge-ghost badge-sm font-medium text-base-content/50">
              {source}
            </span>
          )}
        </div>

        {!loading && !error && items.length > 1 && (
          <div
            className={
              fits
                ? "hidden"
                : "flex gap-2 opacity-0 transition-opacity duration-200 group-hover/section:opacity-100 group-focus-within/section:opacity-100"
            }
          >
            {/* Só renderiza a direção utilizável: sem botão morto para o remote */}
            {!atStart && (
              <FocusButton
                type="button"
                aria-label="Conteúdo anterior"
                onClick={() => swiperRef.current?.slidePrev()}
                className="btn btn-circle btn-sm btn-outline"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </FocusButton>
            )}
            {!atEnd && (
              <FocusButton
                type="button"
                aria-label="Próximo conteúdo"
                onClick={() => swiperRef.current?.slideNext()}
                className="btn btn-circle btn-sm btn-outline"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </FocusButton>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div aria-busy="true" className="flex gap-4">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <div key={i} className={`${POSTER_WIDTH} shrink-0`}>
              <PosterSkeleton />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-base-content/10" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-base-content/10" />
            </div>
          ))}
        </div>
      )}

      {error && <ErrorAlert message={`Não foi possível carregar “${title}”: ${error}`} onRetry={retry} />}

      {!loading && !error && items.length > 0 && (
        <Swiper
          slidesPerView="auto"
          spaceBetween={16}
          grabCursor
          speed={350}
          onSwiper={handleSwiper}
          onSlideChange={syncNav}
          onResize={syncNav}
        >
          {visibleItems.map((item) => (
            <SwiperSlide key={`${item.type}-${item.id}`}>
              <MediaCard item={item} onSelect={onSelect} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
};

export default MediaSection;
