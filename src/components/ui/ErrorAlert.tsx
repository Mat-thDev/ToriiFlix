import { FocusButton } from "./FocusButton";

/** Alerta de erro com retry — padrão único de falha de carregamento nas rotas. */
export const ErrorAlert = ({ message, onRetry, extraAction }: UI.ErrorAlertProps) => (
  <div role="alert" className="alert alert-error">
    <span>{message}</span>
    {onRetry && (
      <FocusButton type="button" className="btn btn-sm btn-outline" onClick={onRetry}>
        Tentar novamente
      </FocusButton>
    )}
    {extraAction}
  </div>
);
