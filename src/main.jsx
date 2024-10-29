import React from "react";
import ReactDOM from "react-dom/client";
// import AppRouter from "./Router";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { RoleProvider } from "./RoleContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>

   <BrowserRouter>
      <App />
      </BrowserRouter>

  </React.StrictMode>
);
