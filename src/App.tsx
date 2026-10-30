import type { ReactElement } from "react";
import AppLayout from "./layouts/AppLayout";
import HomeRoute from "./components/routes/Home";
import DetailRoute from "./components/routes/Detail";
import SearchRoute from "./components/routes/Search";
import NotFoundRoute from "./components/routes/NotFound";
import SettingsRoute from "./components/routes/Settings";
import useNavigation from "./hooks/useNavigation";
import { FocusSection } from "./components/ui/FocusSection";

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

const App = () => {
  const { currentPage, currentProps } = useNavigation();

  return (
    <AppLayout>
      <FocusSection key={currentPage} autoFocus>
        {renderRoute(currentPage, currentProps)}
      </FocusSection>
    </AppLayout>
  );
};

export default App;
