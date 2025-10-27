import { useEffect } from "react";
import './App.css'
import {Routes, Route, Link } from "react-router-dom";

import Home from "./page/Home";



function App() {
  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then(res => res.json())
      .then(data => {
        console.log("Users:", data);
      });
  }, []);

  return(
    <Home/>
  )
}

export default App;
