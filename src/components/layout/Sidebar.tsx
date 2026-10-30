import clsx from "clsx";
import { Grid2x2, History, Home, List, Power, Search, Settings } from "lucide-react";
import useNavigation from "../../hooks/useNavigation";
import { isTV } from "../../platform";
import { FocusSection } from "../ui/FocusSection";
import { FocusButton } from "../ui/FocusButton";

const NAV_ITEMS: UI.NavItem[] = [
  { id: "Search", label: "Pesquisar", Icon: Search },
  { id: "Home", label: "Início", Icon: Home },
  { id: "History", label: "Histórico", Icon: History },
  { id: "Catalogue", label: "Playlists", Icon: List },
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

const Sidebar = () => {
  const { currentPage, navigate } = useNavigation();

  return (
    <nav aria-label="Navegação principal" className="flex h-full w-18 shrink-0 flex-col bg-base-200 py-5">
      <FocusSection focusKey="SIDEBAR">
        {/* Perfil */}
        <FocusButton
          type="button"
          aria-label="Perfil"
          className="mx-auto mb-6 flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-neutral text-sm font-bold text-neutral-content transition-colors hover:bg-primary hover:text-primary-content"
        >
          <span
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/45 to-secondary/45"
          >
            T
          </span>
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
    </nav>
  );
};

export default Sidebar;
