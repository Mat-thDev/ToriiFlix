declare namespace Nav {
  /** Páginas navegáveis do app. */
  type Page = "Home" | "Detail" | "Search" | "Catalogue" | "History" | "Channels" | "Settings";

  /** Props aceitas por cada página (fonte única do contrato de rotas). */
  interface PageProps {
    Home: undefined;
    Detail: UI.DetailProps;
    Search: undefined;
    Catalogue: undefined;
    History: undefined;
    Channels: undefined;
    Settings: undefined;
  }

  interface RouteState {
    page: Page;
    props?: PageProps[Page];
  }

  interface NavState {
    current: RouteState;
    stack: RouteState[];
  }
}
