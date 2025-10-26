import { useEffect } from "react";
import './App.css'
import {Routes, Route, Link } from "react-router-dom";
function App() {
  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then(res => res.json())
      .then(data => {
        console.log("Users:", data);
      });
  }, []);

  return <h1>Check console!</h1>;
}

export default App
