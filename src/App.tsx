import type { ReactElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppLayout from "./layouts/AppLayout";
import HomeRoute from "./components/routes/Home";
import DetailRoute from "./components/routes/Detail";
import SearchRoute from "./components/routes/Search";
import CatalogueRoute from "./components/routes/Catalogue";
import NotFoundRoute from "./components/routes/NotFound";
import SettingsRoute from "./components/routes/Settings";
import useNavigation from "./hooks/useNavigation";
import useProfile from "./hooks/useProfile";
import { useAppTransition } from "./hooks/useAppearance";
import WindowControls from "./components/layout/WindowControls";
import { FocusSection } from "./components/ui/FocusSection";
import WhosWatching from "./components/ui/WhosWatching";
import WatchRoute from "./components/routes/Watch";
import HistoryRoute from "./components/routes/History";


const renderRoute = (page: Nav.Page, props: Nav.PageProps[Nav.Page]): ReactElement => {
  switch (page) {
    case "Detail":
      return <DetailRoute {...(props as UI.DetailProps)} />;
    case "Search":
      return <SearchRoute />;
    case "Settings":
      return <SettingsRoute />;
    case "Catalogue":
      return <CatalogueRoute />;
    case "History":
      return <HistoryRoute />;
    case "Channels":
      return <NotFoundRoute />;
    case "Watch":
      return <WatchRoute />;
    default:
      return <HomeRoute />;
  }
};

const FloatingWindowControls = () => (
  <div className="fixed top-6 right-8 z-60">
    <WindowControls />
  </div>
);

const App = () => {
  const { currentPage, currentProps } = useNavigation();
  const { activeProfile, switcherOpen, closeSwitcher } = useProfile();
  const transition = useAppTransition(0.25);

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
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
          >
            <FocusSection autoFocus>
              {renderRoute(currentPage, currentProps)}
            </FocusSection>
          </motion.div>
        </AnimatePresence>
      </AppLayout>

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
