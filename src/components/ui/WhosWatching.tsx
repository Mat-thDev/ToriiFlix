import { useEffect, useState } from "react";
import clsx from "clsx";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import useProfile from "../../hooks/useProfile";
import { isBackEvent } from "../../platform/input";
import { FocusButton } from "./FocusButton";
import { FocusSection } from "./FocusSection";
import { Input } from "./Input";
import Keyboard from "./Keyboard";

/** Nome limitado pelo teclado na tela (remote 10-foot). */
const MAX_NAME_LENGTH = 20;

type EditorState = { mode: "create" } | { mode: "edit"; profileId: string };

/** Inicial do nome — fallback do avatar quando não há imagem. */
const initialOf = (name: string) => name.trim().charAt(0).toUpperCase() || "?";

/** Avatar do perfil: imagem quando existe, senão inicial em gradiente (padrão Sidebar). */
const Avatar = ({
  picture,
  name,
  className,
}: {
  picture: string;
  name: string;
  className?: string;
}) =>
  picture ? (
    <img
      src={picture}
      alt=""
      loading="lazy"
      decoding="async"
      className={clsx("object-cover", className)}
    />
  ) : (
    <span
      aria-hidden="true"
      className={clsx(
        "flex items-center justify-center bg-linear-to-br from-primary/45 to-secondary/45 font-bold",
        className,
      )}
    >
      {initialOf(name)}
    </span>
  );

/**
 * Tela de perfis: gate obrigatório enquanto `activeProfile === null`
 * (sem `onClose`) e seletor de troca em runtime sobre o app (com `onClose`).
 * Navegação espacial: seção é fronteira de foco, então setas nunca vazam
 * para o app atrás do overlay.
 */
const WhosWatching = ({ onClose }: UI.WhosWatchingProps) => {
  const { activeProfile, profilesAvaliable, changeProfile, createProfile, editProfile, removeProfile } =
    useProfile();

  const [editor, setEditor] = useState<EditorState | null>(null);
  const [manage, setManage] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [backdrop, setBackdrop] = useState("");

  const editingProfile =
    editor?.mode === "edit"
      ? profilesAvaliable.find((item) => item.id === editor.profileId)
      : undefined;

  // Esc/Backspace/voltar (remote webOS): fecha camada por camada. No gate
  // bloqueia o voltar global, senão a pilha de navegação mudaria atrás dele.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || !isBackEvent(e)) return;
      e.preventDefault();

      if (editor) {
        setEditor(null);
        setDraftName("");
      } else if (pendingDelete) {
        setPendingDelete(null);
      } else if (manage) {
        setManage(false);
      } else {
        onClose?.();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [editor, pendingDelete, manage, onClose]);

  const select = (profile: Users.Profile) => {
    changeProfile(profile);
    onClose?.();
  };

  const closeEditor = () => {
    setEditor(null);
    setDraftName("");
  };

  const openCreate = () => {
    setDraftName("");
    setEditor({ mode: "create" });
  };

  const openEdit = (profile: Users.Profile) => {
    setDraftName(profile.display_name);
    setEditor({ mode: "edit", profileId: profile.id });
  };

  const saveEditor = () => {
    const name = draftName.trim();
    if (!name || !editor) return;

    if (editor.mode === "create") createProfile({ display_name: name });
    else editProfile(editor.profileId, { display_name: name });

    closeEditor();
  };

  const pushChar = (value: string) =>
    setDraftName((prev) => (prev.length >= MAX_NAME_LENGTH ? prev : prev + value));

  const backspace = () => setDraftName((prev) => prev.slice(0, -1));

  return (
    <section aria-label="Seleção de perfil" className="torii-scroll-y fixed inset-0 z-50 bg-base-300">
      {/* Fundo: background do perfil em foco (padrão Search/Hero), com fallback temático */}
      {backdrop ? (
        <img
          src={backdrop}
          alt=""
          loading="eager"
          decoding="async"
          className="fixed inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_16%,transparent),transparent_60%)]"
        />
      )}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--color-base-300)_80%,transparent)_0%,color-mix(in_oklab,var(--color-base-300)_90%,transparent)_55%,var(--color-base-300)_100%)]"
      />

      <FocusSection
        focusKey="PROFILES"
        autoFocus
        isFocusBoundary
        className="relative flex min-h-full w-full flex-col items-center justify-center px-8 py-12"
      >
        <header className="text-center">
          <p className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
            {manage ? "Gerenciar" : "Perfis"}
          </p>
          <h1 className="mt-3">{manage ? "Editar perfis" : "Quem está assistindo?"}</h1>
          <p className="mt-3 text-sm text-base-content/60">
            {manage
              ? "Selecione um perfil para editar ou exclua pelo botão abaixo dele."
              : profilesAvaliable.length === 0
                ? "Crie um perfil para começar."
                : "Selecione um perfil para continuar."}
          </p>
        </header>

        {editor ? (
          <FocusSection focusKey="PROFILE_EDITOR" autoFocus className="mt-9 w-full max-w-2xl">
            <div className="rounded-box border border-base-content/10 bg-base-200/80 p-6">
              <div className="flex items-center gap-4">
                <Avatar
                  picture={editingProfile?.profile_picture ?? ""}
                  name={draftName || editingProfile?.display_name || ""}
                  className="size-20 shrink-0 rounded-xl text-2xl"
                />

                <div className="min-w-0 flex-1">
                  <div className="rounded-lg border border-base-content/15 bg-base-100/60 px-4 py-3">
                    <Input
                      readOnly
                      tabIndex={-1}
                      aria-label="Nome do perfil"
                      value={draftName}
                      placeholder="Nome do perfil"
                      className="text-xl font-bold placeholder:text-base-content/35"
                    />
                  </div>
                  <p className="mt-1 text-right text-xs text-base-content/40">
                    {draftName.length}/{MAX_NAME_LENGTH}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Keyboard onChar={pushChar} onBackspace={backspace} />
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <FocusButton
                  type="button"
                  disabled={!draftName.trim()}
                  onClick={saveEditor}
                  className="btn btn-sm btn-primary"
                >
                  Salvar
                </FocusButton>
                <FocusButton type="button" onClick={closeEditor} className="btn btn-sm btn-ghost">
                  Cancelar
                </FocusButton>
                {editor.mode === "edit" && (
                  <FocusButton
                    type="button"
                    onClick={() => {
                      const { profileId } = editor;
                      closeEditor();
                      removeProfile(profileId);
                    }}
                    className="btn btn-sm btn-outline btn-error"
                  >
                    Excluir perfil
                  </FocusButton>
                )}
              </div>
            </div>
          </FocusSection>
        ) : (
          <>
            <FocusSection focusKey="PROFILES_GRID" autoFocus className="mt-9">
              <ul className="flex flex-wrap items-start justify-center gap-5 md:gap-7">
                {profilesAvaliable.map((profile) => {
                  const isActive = activeProfile?.id === profile.id;
                  const confirming = pendingDelete === profile.id;

                  return (
                    <li key={profile.id} className="w-32 text-center md:w-36 lg:w-40">
                      <FocusButton
                        type="button"
                        data-focus="inner"
                        onClick={() => (manage ? openEdit(profile) : select(profile))}
                        onFocus={() => setBackdrop(profile.background)}
                        aria-label={
                          manage
                            ? `Editar ${profile.display_name}`
                            : `Entrar como ${profile.display_name}`
                        }
                        className="group block w-full p-2"
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-base-200 ring-1 ring-base-content/10 transition-shadow duration-200 group-data-focused:ring-2 group-data-focused:ring-primary">
                          <Avatar
                            picture={profile.profile_picture}
                            name={profile.display_name}
                            className="h-full w-full text-4xl"
                          />

                          {isActive && (
                            <span
                              aria-hidden="true"
                              className="absolute right-2 bottom-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-content"
                            >
                              <Check className="size-4" />
                            </span>
                          )}

                          {manage && (
                            <span
                              aria-hidden="true"
                              className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-base-100/85 text-base-content backdrop-blur-sm"
                            >
                              <Pencil className="size-3.5" />
                            </span>
                          )}
                        </div>

                        <p className="mt-3 line-clamp-1 font-semibold">{profile.display_name}</p>
                      </FocusButton>

                      {manage && (
                        <FocusButton
                          type="button"
                          onClick={() => (confirming ? removeProfile(profile.id) : setPendingDelete(profile.id))}
                          onBlur={() => setPendingDelete((id) => (id === profile.id ? null : id))}
                          aria-label={
                            confirming
                              ? `Confirmar exclusão de ${profile.display_name}`
                              : `Excluir ${profile.display_name}`
                          }
                          className={clsx(
                            "mt-1 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors",
                            confirming
                              ? "bg-error text-error-content"
                              : "bg-base-content/5 text-base-content/60 hover:text-error",
                          )}
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          {confirming ? "Confirmar" : "Excluir"}
                        </FocusButton>
                      )}
                    </li>
                  );
                })}

                <li className="w-32 text-center md:w-36 lg:w-40">
                  <FocusButton
                    type="button"
                    data-focus="inner"
                    onClick={openCreate}
                    onFocus={() => setBackdrop("")}
                    aria-label="Adicionar perfil"
                    className="group block w-full p-2"
                  >
                    <div className="flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-base-content/20 bg-base-content/5 transition-colors group-data-focused:border-primary group-data-focused:bg-primary/10">
                      <Plus className="size-8 text-base-content/40 group-data-focused:text-primary" aria-hidden="true" />
                    </div>
                    <p className="mt-3 font-semibold text-base-content/70">Adicionar</p>
                  </FocusButton>
                </li>
              </ul>
            </FocusSection>

            <FocusSection focusKey="PROFILES_ACTIONS" className="mt-8 flex items-center justify-center gap-2">
              {/* "Concluir" fica sempre disponível em manage (sai do modo mesmo sem perfis) */}
              {(manage || profilesAvaliable.length > 0) && (
                <FocusButton
                  type="button"
                  aria-pressed={manage}
                  onClick={() => {
                    setManage((open) => !open);
                    setPendingDelete(null);
                  }}
                  className={clsx("btn btn-sm gap-2", manage ? "btn-primary" : "btn-outline")}
                >
                  {manage ? <Check className="size-4" aria-hidden="true" /> : <Pencil className="size-4" aria-hidden="true" />}
                  {manage ? "Concluir" : "Editar perfis"}
                </FocusButton>
              )}

              {onClose && (
                <FocusButton type="button" onClick={onClose} className="btn btn-sm btn-ghost gap-2">
                  <X className="size-4" aria-hidden="true" />
                  Voltar
                </FocusButton>
              )}
            </FocusSection>
          </>
        )}
      </FocusSection>
    </section>
  );
};

export default WhosWatching;
