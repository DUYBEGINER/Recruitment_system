import { useEffect } from "react";
import './App.css'
import {Routes, Route, Link } from "react-router-dom";
import Home from "./page/Home";
import LoginPage from "./page/LoginPage";
import RegisterPage from "./page/RegisterPage";

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;
