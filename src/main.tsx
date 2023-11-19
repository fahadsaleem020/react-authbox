import { Provider } from "@components/userprovider";
import ReactDOM from "react-dom/client";
import React from "react";
import App from "./App";

// force
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider fetchUserFrom="user" baseUrl="http://localhost:3000/api/">
      <App />
    </Provider>
  </React.StrictMode>
);
