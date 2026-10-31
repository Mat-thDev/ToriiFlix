import type { ReactElement } from "react";
import AppLayout from "./layouts/AppLayout";
import HomeRoute from "./components/routes/Home";
import DetailRoute from "./components/routes/Detail";
import SearchRoute from "./components/routes/Search";
import NotFoundRoute from "./components/routes/NotFound";
import SettingsRoute from "./components/routes/Settings";
import useNavigation from "./hooks/useNavigation";
import useProfile from "./hooks/useProfile";
import WindowControls from "./components/layout/WindowControls";
import { FocusSection } from "./components/ui/FocusSection";
import WhosWatching from "./components/ui/WhosWatching";

/** Roteamento sem componentes dinâmicos: cada página com suas props do contrato Nav.PageProps. */
const renderRoute = (page: Nav.Page, props: Nav.PageProps[Nav.Page]): ReactElement => {
  switch (page) {
    case "Detail":
      // navigate("Detail", ...) sempre envia { id, type } — contrato em Nav.PageProps
      return <DetailRoute {...(props as UI.DetailProps)} />;
    case "Search":
      return <SearchRoute />;
    case "Settings":
      return <SettingsRoute />;
    case "Catalogue":
    case "History":
    case "Channels":
      return <NotFoundRoute />;
    default:
      return <HomeRoute />;
  }
};

/**
 * A janela roda com `decorations: false`, então sobre o overlay de perfis
 * (que cobre a TopBar) os controles flutuam acima — fora do desktop é null.
 */
const FloatingWindowControls = () => (
  <div className="fixed top-6 right-8 z-[60]">
    <WindowControls />
  </div>
);

const App = () => {
  const { currentPage, currentProps } = useNavigation();
  const { activeProfile, switcherOpen, closeSwitcher } = useProfile();

  if (!activeProfile)
    return (
      <>
        <WhosWatching />
        <FloatingWindowControls />
      </>
    );

  return (
    <>
      <AppLayout>
        <FocusSection key={currentPage} autoFocus>
          {renderRoute(currentPage, currentProps)}
        </FocusSection>
      </AppLayout>

      {/* Troca em runtime: seletor por cima do app, fechável com Esc/back */}
      {switcherOpen && (
        <>
          <WhosWatching onClose={closeSwitcher} />
          <FloatingWindowControls />
        </>
      )}
    </>
  );
};

export default App;
