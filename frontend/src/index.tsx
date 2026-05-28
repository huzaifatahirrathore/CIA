import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Provider } from "react-redux";
import store from "./store/store";

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<Provider store={store}><App /></Provider>);

serviceWorker.unregister();
