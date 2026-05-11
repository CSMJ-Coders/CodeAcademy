
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  // i18n initialization
  import './i18n'

  createRoot(document.getElementById("root")!).render(<App />);
  