import { useState } from 'react'
import './App.css'
import {Routes, Route, Link } from "react-router-dom";
function App() {
  
  return (
     <Routes>
      <Route path="/" element={<h1>Home Page</h1>} />
      <Route path="/about" element={<h1>About Page</h1>} />
    </Routes>
     

  )
}

export default App
