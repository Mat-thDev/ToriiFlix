import { useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Bookmark, Grid2x2, History, Home, Power, Search, Settings } from "lucide-react";
import useNavigation from "../../hooks/useNavigation";
import useProfile from "../../hooks/useProfile";
import useAppearance, { useAppTransition } from "../../hooks/useAppearance";
import { isTV } from "../../platform";
import { FocusSection } from "../ui/FocusSection";
import { FocusButton } from "../ui/FocusButton";

const NAV_ITEMS: UI.NavItem[] = [
  { id: "Search", label: "Pesquisar", Icon: Search },
  { id: "Home", label: "Início", Icon: Home },
  { id: "History", label: "Histórico", Icon: History },
  { id: "Catalogue", label: "Favoritos", Icon: Bookmark },
  { id: "Channels", label: "Guia de TV", Icon: Grid2x2 },
];

/** Estilo único do item da barra — ativo, inerte e destrutivo (Sair). */
const itemClass = (variant: "active" | "idle" | "danger") =>
  clsx(
    "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
    variant === "active" && "bg-primary/15 text-primary",
    variant === "idle" && "text-base-content/60 hover:bg-neutral hover:text-base-content",
    variant === "danger" && "text-base-content/40 hover:bg-error/15 hover:text-error",
  );

/**
 * Barra lateral — modo `always` fixa na coluna do grid; modo `focus` vira
 * overlay que desliza da esquerda quando o foco/hover chega nela (e volta
 * a esconder quando sai). Animação via framer-motion + useAppTransition.
 */
const Sidebar = () => {
  const { currentPage, navigate } = useNavigation();
  const { activeProfile, openSwitcher } = useProfile();
  const { sidebarMode } = useAppearance();
  const transition = useAppTransition(0.3);

  const overlay = sidebarMode === "focus";
  const [hover, setHover] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const shown = !overlay || hover || focusWithin;

  const initial = activeProfile?.display_name.trim().charAt(0).toUpperCase() || "?";

  return (
    <>
      {/* Faixa de revelação: no modo overlay escondido, o mouse na borda traz a barra */}
      {overlay && !shown && (
        <div
          aria-hidden="true"
          className="fixed top-0 left-0 z-40 h-full w-3"
          onMouseEnter={() => setHover(true)}
        />
      )}

      <motion.nav
        aria-label="Navegação principal"
        animate={{ x: shown ? 0 : "-100%" }}
        transition={transition}
        initial={false}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setFocusWithin(true)}
        onBlur={(event) => {
          // Saiu de dentro da barra (ou o nó focado foi removido) → esconde
          if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false);
        }}
        className={clsx(
          "flex h-full w-18 shrink-0 flex-col bg-base-200 py-5",
          overlay && "absolute top-0 left-0 z-40 h-full shadow-2xl",
        )}
      >
        <FocusSection focusKey="SIDEBAR">
          {/* Perfil — abre o seletor de troca em runtime */}
          <FocusButton
            type="button"
            title="Trocar perfil"
            aria-label={activeProfile ? `Trocar de perfil (${activeProfile.display_name})` : "Perfil"}
            onClick={openSwitcher}
            className="mx-auto mb-6 flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-neutral text-sm font-bold text-neutral-content transition-colors hover:bg-primary hover:text-primary-content"
          >
            {activeProfile?.profile_picture ? (
              <img
                src={activeProfile.profile_picture}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/45 to-secondary/45"
              >
                {initial}
              </span>
            )}
          </FocusButton>

          {/* Navegação principal */}
          <ul className="flex flex-col items-center">
            {NAV_ITEMS.map(({ id, label, Icon }) => {
              const active = id === currentPage;
              return (
                <li key={id} className="mb-1">
                  <FocusButton
                    type="button"
                    title={label}
                    aria-label={label}
                    aria-current={active ? "page" : undefined}
                    onClick={() => navigate(id)}
                    className={itemClass(active ? "active" : "idle")}
                  >
                    <Icon width={22} height={22} />
                  </FocusButton>
                </li>
              );
            })}
          </ul>

          {/* Rodapé: sistema */}
          <div className="mt-auto flex flex-col items-center">
            <div aria-hidden="true" className="mb-3 h-px w-8 bg-base-content/10" />

            <FocusButton
              type="button"
              title="Configurações"
              aria-label="Configurações"
              aria-current={currentPage === "Settings" ? "page" : undefined}
              onClick={() => navigate("Settings")}
              className={itemClass(currentPage === "Settings" ? "active" : "idle")}
            >
              <Settings width={22} height={22} />
            </FocusButton>

            {isTV && (
              <FocusButton type="button" title="Sair" aria-label="Sair" className={itemClass("danger")}>
                <Power width={22} height={22} />
              </FocusButton>
            )}
          </div>
        </FocusSection>
      </motion.nav>
    </>
  );
};

export default Sidebar;
