import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ViewRouter from "./pages/ViewRouter";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ViewRouter />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
