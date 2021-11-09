import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Grid from "./Grid";
import Justified from "./Justified";

const App = () => do {
  <BrowserRouter>
    <Routes>
      <Route path="/*" element={do { <Grid /> }} />
      <Route path="/justified" element={do { <Justified /> }} />
    </Routes>
  </BrowserRouter>
}

window.addEventListener("load", () => {
  ReactDOM.render(
    React.createElement(App),
    document.getElementById("react-root")
  );
});