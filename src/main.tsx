import ReactDOM from "react-dom/client";
import App from "./App";
import Provider from "./Provider";
import "./styles/App.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider>
    <App />
  </Provider>,
);
