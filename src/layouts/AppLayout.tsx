import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";

const AppLayout = ({ children }: UI.AppLayoutProps) => (
  <div className="grid h-full w-full grid-cols-[72px_1fr] overflow-hidden bg-base-300">
    <Sidebar />

    <div className="relative flex min-w-0 flex-col overflow-hidden">
      {/* backdrop placeholder — depois vira imagem + gradiente (sintaxe antiga-safe p/ webOS) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 bottom-0 left-0 bg-[radial-gradient(120%_80%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_16%,transparent),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(to_bottom,transparent_0%,color-mix(in_oklab,var(--color-base-300)_75%,transparent)_55%,var(--color-base-300)_100%)]"
      />

      <TopBar />

      <main className="torii-scroll-y relative flex-1 px-8 pb-8 pt-6">{children}</main>
    </div>
  </div>
);

export default AppLayout;
