import { createRoot } from "react-dom/client";
import { Site } from "../app/site";
import "../app/globals.css";
import "../app/mobile-overrides.css";
createRoot(document.getElementById("root")!).render(<Site />);
