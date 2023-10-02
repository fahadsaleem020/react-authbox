import ReactDOM from "react-dom/client";
import { Provider } from "@components/userprovider";
import App from "./App";
import React from "react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider fetchUserUrl="http://localhost:3000/api/user">
      <App />
    </Provider>
  </React.StrictMode>
);
