import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Grid from "./Grid";
import Justified from "./Justified";

const App = () => do {
  <BrowserRouter>
    <Routes>
      <Route path="/*" element={<Grid />} />
      <Route path="/justified" element={<Justified />} />
    </Routes>
  </BrowserRouter>
}

window.addEventListener("load", () => {
  ReactDOM.render(
    React.createElement(App),
    document.getElementById("react-root")
  );
});