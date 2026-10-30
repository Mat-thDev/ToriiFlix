import { FocusButton } from "../../ui/FocusButton";
import useNavigation from "../../../hooks/useNavigation";

const NotFoundRoute = () => {
  const { navigate } = useNavigation();

  return (
    <section aria-label="Não encontrado">
      <h1>Ops! Parece que você achou algo que não devia!</h1>
      <FocusButton type="button" onClick={() => navigate("Home")} className="btn btn-outline mt-6">
        Ir para o início
      </FocusButton>
    </section>
  );
};

export default NotFoundRoute;
