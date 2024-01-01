import { UserProvider } from "@components/userprovider";
import ReactDOM from "react-dom/client";
import React from "react";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider fetchUserFrom="user" baseUrl="http://localhost:3000/api">
      <App />
    </UserProvider>
  </React.StrictMode>
);
