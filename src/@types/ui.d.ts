/**
 * Tipagens de UI — componentes, layout e ícones.
 * Uso: `UI.IconComponent`, `UI.NavItem`, `UI.WindowAction`, ...
 */
declare namespace UI {
  /** Componente de ícone aceito no app (lucide-react). */
  type IconComponent = import("lucide-react").LucideIcon;

  /** Item do menu lateral (Sidebar). */
  type NavItem = {
    id: Nav.Page;
    label: string;
    Icon: IconComponent;
  };

  /** Props do layout raiz (AppLayout). */
  type AppLayoutProps = {
    children?: React.ReactNode;
  };

  /** Props do Provider de contexto/tema. */
  type ProviderProps = {
    children: React.ReactNode;
  };

  /** Relógio/saudação exibido na TopBar. */
  type Clock = {
    time: string;
    date: string;
    greeting: string;
  };

  /** Ações dos controles de janela (minimizar/maximizar/fechar). */
  type WindowAction = "minimize" | "toggleMaximize" | "close";

  /** Props do botão focável (navegação espacial — remote/setas). */
  interface FocusButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Expõe o `<button>` interno (ex.: para focar a primeira tecla do teclado na tela). */
    buttonRef?: React.RefObject<HTMLButtonElement | null>;
  }

  /** Props da seção focável (provedor de contexto de foco). */
  interface FocusSectionProps {
    children: React.ReactNode;
    className?: string;
    focusKey?: string;
    autoFocus?: boolean;
    "aria-label"?: string;
  }

  /** Props do campo de entrada (display de busca). */
  interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

  /** Switch focável (navegação espacial). Com `checked` vira controlado. */
  interface ToggleProps {
    /** Rótulo acessível (aria-label). */
    label?: string;
    /** Estado controlado — quando ausente, o estado é interno. */
    checked?: boolean;
    defaultOn?: boolean;
    onChange?: (on: boolean) => void;
  }

  /** Opção do controle segmentado (substitui select — amigável p/ remote). */
  interface SegmentedOption<T extends string = string> {
    value: T;
    label: string;
  }

  /** Conjunto de opções mutuamente exclusivas (configurações). */
  interface SegmentedControlProps<T extends string = string> {
    value: T;
    options: SegmentedOption<T>[];
    onChange: (value: T) => void;
    "aria-label"?: string;
  }

  /** Linha de configuração: descrição à esquerda, controle à direita. */
  interface SettingsRowProps {
    title: string;
    description?: string;
    control: React.ReactNode;
  }

  /** Grupo de linhas de configuração (cartão com título). */
  interface SettingsGroupProps {
    title?: string;
    children: React.ReactNode;
  }

  /** Aba da rota Settings — registrar em `routes/Settings/index.tsx`. */
  interface SettingsTab {
    id: string;
    label: string;
    Icon: IconComponent;
    component: React.ComponentType;
  }

  /** Hero de destaque/detalhe — imagem + scrims + texto + ações. */
  interface HeroProps {
    item: Media.Item;
    /** Sobrescreve o eyebrow padrão (ex.: "Filme", "Série"). */
    eyebrow?: string;
    actions?: React.ReactNode;
  }

  /** Billboard de destaque da Home (estilo HBO/Netflix/Crunchyroll). */
  interface BillboardProps {
    item: Media.Item | null;
    loading?: boolean;
  }

  /** Card de pôster (catálogo) — linha do catálogo/carrossel. */
  interface MediaCardProps {
    item: Media.Item;
    onSelect?: (item: Media.Item) => void;
  }

  /** Seção de conteúdo da Home (título + carrossel de catálogo do addon). */
  interface MediaSectionProps {
    title: string;
    kind: Media.Kind;
    /** Id do catálogo no addon (ids do Cinemeta ou do manifest externo). */
    list?: string;
    /** Extra `genre` do addon (gênero ou ano, conforme o catálogo). */
    genre?: string;
    limit?: number;
    /** Bases consultadas — default: todos os addons habilitados com `catalog`. */
    sources?: string[];
    /** Fonte exibida como badge ao lado do título (seção exclusiva de addon). */
    source?: string;
    onSelect?: (item: Media.Item) => void;
  }

  /** Alerta de erro com ação de retry — usado em todas as rotas. */
  interface ErrorAlertProps {
    message: string;
    onRetry?: () => void;
    /** Ação extra ao lado do retry (ex.: "Voltar"). */
    extraAction?: React.ReactNode;
  }

  /** Props da rota de detalhe (ids na navegação; meta é buscada na rota). */
  interface DetailProps {
    id?: string;
    type?: Media.Kind;
  }

  /** Props do teclado na tela da página de busca. */
  interface KeyboardProps {
    onChar: (value: string) => void;
    onBackspace: () => void;
  }
}
