// src/App.js
import React from 'react'
import Header from './components/Header'
import PrintManager from './components/PrintManager'
import './App.css'

function App() {
  return (
    <div className="App">
      <div className="App-header">
        <Header />
        <PrintManager />
      </div>
    </div>
  )
}

export default App
